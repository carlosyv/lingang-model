"""Solution matching: Match_Score = alpha*cosine_sim + beta*cluster_fit + gamma*policy_score + delta*risk_adj.

Simplified version of the framework's five-layer matching engine (Layers 1-3, 5).
cluster_fit reuses the archetype-membership probability as a stand-in for the
XGBoost (supplier, country) classifier described in the deck. Layer 4 (CAPEX
recomputation against live commodity prices) is out of MVP scope.

Layer 2 (supplier feasibility) and Layer 3 (policy alignment) are implemented as
hard gates per the deck's "Policy Gates" and "Company F-Block" pages: a pair is
ELIMINATEd, FLAGGED for review, or allowed to PROCEED, independent of the
weighted Match_Score. Only PROCEED/FLAG_FOR_REVIEW pairs are returned ranked;
ELIMINATE pairs are returned separately with their gate reasons.
"""
from __future__ import annotations

import math

from app.core.config import settings
from app.services.risk import composite_risk

GATE_ORDER = {"PROCEED": 0, "FLAG_FOR_REVIEW": 1, "ELIMINATE": 2}
GATE_POLICY_SCORE = {"PROCEED": 1.0, "FLAG_FOR_REVIEW": 0.5, "ELIMINATE": 0.0}

# Projects the 68-dim country parameter vector into the same 10-dim L-space used by
# solution vectors (L01-L10), so cosine similarity is meaningful. Each L-slot maps to
# the country parameter most relevant to that solution dimension.
COUNTRY_TO_L_KEY = {
    "L01": "I09",  # fossil/gas pipeline infrastructure fit (blue H2, CCUS)
    "L02": "E02",  # solar potential
    "L03": "E03",  # wind potential
    "L04": "R14",  # critical mineral endowment (phosphate/lithium proxy)
    "L05": "I10",  # hydrogen readiness
    "L06": "X04",  # grid/logistics readiness for distributed deployment
    "L07": "T01",  # digital/smart-grid readiness
    "L08": "E09",  # NDC/environmental ambition
    "L09": "S05",  # fiscal capacity
    "L10": "G01",  # political stability
}


def _project_country_to_l_space(parameters: dict) -> dict:
    return {l_key: parameters.get(param_key, 0.0) for l_key, param_key in COUNTRY_TO_L_KEY.items()}


def _cosine_similarity(a: dict, b: dict) -> float:
    keys = sorted(set(a) | set(b))
    va = [a.get(k, 0.0) for k in keys]
    vb = [b.get(k, 0.0) for k in keys]
    dot = sum(x * y for x, y in zip(va, vb))
    norm_a = math.sqrt(sum(x * x for x in va))
    norm_b = math.sqrt(sum(y * y for y in vb))
    denom = norm_a * norm_b
    if denom == 0:
        return 0.0
    return dot / denom


def _policy_gate(policy_gates: dict) -> tuple[str, list[str]]:
    """Layer 3 (Policy Alignment) hard gate, per the deck's POLICY GATE logic:
    'if PO21(sanctions) >= 2 -> ELIMINATE; if PO19(BIT)=0 AND PO20(FTA)=0 -> FLAG FOR REVIEW; else -> PROCEED'
    """
    reasons: list[str] = []
    sanctions = policy_gates.get("PO21")
    if sanctions is not None and sanctions >= 2:
        reasons.append(f"PO21 sanctions exposure = {sanctions} (>= 2 eliminates)")
        return "ELIMINATE", reasons

    bit_depth = policy_gates.get("PO19") or 0
    fta_depth = policy_gates.get("PO20") or 0
    if bit_depth == 0 and fta_depth == 0:
        reasons.append("PO19 (BIT depth) = 0 and PO20 (FTA depth) = 0")
        return "FLAG_FOR_REVIEW", reasons

    # Non-blocking policy notes carried over from the deck's operational bottom-line.
    if policy_gates.get("PO09") == 0:
        reasons.append("PO09=0 blocks Carbon Bridge (no carbon revenue channel)")
    if (policy_gates.get("PO05") or 0) < 2:
        reasons.append("PO05<2 blocks AI platform export")
    if policy_gates.get("CP03") == 0:
        reasons.append("CP03 export control not cleared")
    if (policy_gates.get("CP01") or 0) >= 2:
        reasons.append("CP01 EIA level >= 2 adds 6-18 months to permitting timeline")

    return "PROCEED", reasons


def _supplier_gate(f_vector: dict) -> tuple[str, list[str]]:
    """Layer 2 (Supplier Feasibility) hard gate over the company F-block vector."""
    reasons: list[str] = []
    if not f_vector:
        return "PROCEED", reasons

    if f_vector.get("F13", 0) == 0:
        reasons.append("F13=0: supplier not Lin-Gang FTZ registered")
        return "ELIMINATE", reasons

    if f_vector.get("F01", 1.0) < 0.6:
        reasons.append(f"F01={f_vector.get('F01')}: technology readiness level below 0.6")
        return "FLAG_FOR_REVIEW", reasons

    return "PROCEED", reasons


def _combine_gates(policy_status: str, supplier_status: str) -> str:
    return max((policy_status, supplier_status), key=lambda s: GATE_ORDER[s])


def compute_matches(
    country: dict,
    solutions: list[dict],
) -> dict[str, list[dict]]:
    """country: {"parameters", "cluster_probabilities", "policy_gates"}
    solutions: list of {"id", "l_vector", "f_vector"}

    Returns {"ranked": [...], "excluded": [...]} - ranked holds PROCEED/FLAG_FOR_REVIEW
    pairs sorted by match_score descending; excluded holds ELIMINATEd pairs with reasons.
    """
    cluster_probs = country.get("cluster_probabilities") or {}
    top_prob = max(cluster_probs.values()) if cluster_probs else 0.5
    policy_gates = country.get("policy_gates") or {}
    policy_status, policy_reasons = _policy_gate(policy_gates)
    risk_adj = composite_risk(country["parameters"], policy_gates)
    country_l_vector = _project_country_to_l_space(country["parameters"])

    ranked = []
    excluded = []
    for sol in solutions:
        supplier_status, supplier_reasons = _supplier_gate(sol.get("f_vector") or {})
        gate = _combine_gates(policy_status, supplier_status)
        gate_reasons = policy_reasons + supplier_reasons

        policy_score = GATE_POLICY_SCORE[policy_status]
        cosine_sim = _cosine_similarity(country_l_vector, sol["l_vector"])
        match_score = (
            settings.match_alpha * cosine_sim
            + settings.match_beta * top_prob
            + settings.match_gamma * policy_score
            + settings.match_delta * risk_adj
        )
        row = {
            "solution_id": sol["id"],
            "cosine_sim": round(cosine_sim, 4),
            "cluster_fit": round(top_prob, 4),
            "policy_score": round(policy_score, 4),
            "risk_adj": round(risk_adj, 4),
            "match_score": round(match_score, 4),
            "viable": cosine_sim > settings.match_threshold,
            "gate": gate,
            "gate_reasons": gate_reasons,
        }
        if gate == "ELIMINATE":
            excluded.append(row)
        else:
            ranked.append(row)

    ranked.sort(key=lambda r: r["match_score"], reverse=True)
    return {"ranked": ranked, "excluded": excluded}
