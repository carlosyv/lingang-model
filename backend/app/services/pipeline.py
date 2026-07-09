from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.orm import Country, Match, PolicyGate, Solution
from app.services.clustering import assign_clusters
from app.services.matching import compute_matches


def recompute_clusters(db: Session) -> None:
    countries = db.execute(select(Country)).scalars().all()
    if len(countries) < 2:
        return
    payload = [{"id": c.id, "parameters": c.parameters} for c in countries]
    assignments = assign_clusters(payload)

    for c in countries:
        result = assignments.get(c.id)
        if result:
            c.cluster_label = result["cluster_label"]
            c.cluster_probabilities = result["cluster_probabilities"]
    db.commit()


def compute_country_matches(db: Session, country_id: int) -> dict[str, list[dict]] | None:
    country = db.get(Country, country_id)
    if country is None:
        return None
    if country.cluster_label is None:
        recompute_clusters(db)
        db.refresh(country)

    policy_gate = db.execute(
        select(PolicyGate).where(PolicyGate.country_id == country_id)
    ).scalar_one_or_none()
    solutions = db.execute(select(Solution)).scalars().all()

    country_payload = {
        "parameters": country.parameters,
        "cluster_probabilities": country.cluster_probabilities,
        "policy_gates": policy_gate.gates if policy_gate else {},
    }
    solution_payload = [{"id": s.id, "l_vector": s.l_vector, "f_vector": s.f_vector} for s in solutions]

    computed = compute_matches(country_payload, solution_payload)
    solutions_by_id = {s.id: s for s in solutions}

    # Persist ranked (non-eliminated) matches as cache for the demo (upsert).
    for row in computed["ranked"]:
        existing = db.execute(
            select(Match).where(
                Match.country_id == country_id, Match.solution_id == row["solution_id"]
            )
        ).scalar_one_or_none()
        if existing is None:
            existing = Match(country_id=country_id, solution_id=row["solution_id"])
            db.add(existing)
        existing.cosine_sim = row["cosine_sim"]
        existing.cluster_fit = row["cluster_fit"]
        existing.policy_score = row["policy_score"]
        existing.risk_adj = row["risk_adj"]
        existing.match_score = row["match_score"]
    db.commit()

    def _to_match_out(row: dict) -> dict:
        return {
            "solution": solutions_by_id[row["solution_id"]],
            "cosine_sim": row["cosine_sim"],
            "cluster_fit": row["cluster_fit"],
            "policy_score": row["policy_score"],
            "risk_adj": row["risk_adj"],
            "match_score": row["match_score"],
            "viable": row["viable"],
            "gate": row["gate"],
            "gate_reasons": row["gate_reasons"],
        }

    return {
        "ranked": [_to_match_out(r) for r in computed["ranked"]],
        "excluded": [_to_match_out(r) for r in computed["excluded"]],
    }
