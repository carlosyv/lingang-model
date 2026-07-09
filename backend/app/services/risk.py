"""Simplified composite risk score.

Stands in for the framework's five real-time risk sub-models (EGDT, SDP, Monte
Carlo, carbon credit, price Jacobian), which are out of scope for the MVP. Uses
a weighted average of geopolitical stability and fiscal/energy-poverty signals
already present in the seeded parameter vector.
"""
from __future__ import annotations

RISK_INPUT_KEYS = {
    "G01": 0.40,  # political stability (higher = more stable = lower risk)
    "S03": 0.25,  # energy poverty (higher = riskier)
    "S05": 0.20,  # fiscal capacity (higher = lower risk)
    "X04": 0.15,  # infrastructure/logistics readiness (higher = lower risk)
}

# Keys where a higher raw value means *higher* risk (rest are protective / risk-reducing).
RISK_INCREASING_KEYS = {"S03"}


def composite_risk(parameters: dict, policy_gates: dict | None = None) -> float:
    """Returns risk_adj in [0, 1], where 1 = low risk (favorable), 0 = high risk."""
    policy_gates = policy_gates or {}
    total_weight = 0.0
    weighted = 0.0

    for key, weight in RISK_INPUT_KEYS.items():
        value = parameters.get(key)
        if value is None:
            continue
        favorable = (1.0 - value) if key in RISK_INCREASING_KEYS else value
        weighted += favorable * weight
        total_weight += weight

    sanctions = policy_gates.get("PO21")
    if sanctions is not None:
        weighted += (1.0 - min(sanctions, 1.0)) * 0.20
        total_weight += 0.20

    if total_weight == 0:
        return 0.5
    return round(weighted / total_weight, 4)
