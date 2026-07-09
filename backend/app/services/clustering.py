"""Cluster assignment via soft membership scoring against archetype signal parameters.

Mirrors the framework's Layer 2 (Cluster Assignment / soft GMM membership) without a
heavy ML dependency: for the MVP's small seeded country set, each country's score
against each archetype's signal parameters (from LinGang_Framework_Summary.md's
cluster taxonomy) is converted into a probability distribution via softmax, which
behaves like a single-country Gaussian component posterior without requiring
scikit-learn/numpy/scipy in the container image.
"""
from __future__ import annotations

import math

CLUSTER_LETTERS = ["A", "B", "C", "D", "E"]

# Archetype signal parameters, from LinGang_Framework_Summary.md's cluster taxonomy.
# Values are (parameter_key, weight); weight is negative when a *low* value is the signal
# (e.g. cluster B favors low I09 fossil dependence).
ARCHETYPE_SIGNALS: dict[str, list[tuple[str, float]]] = {
    "A": [("S10", 1.0), ("G05", 1.0), ("I09", 1.0)],   # Export-Stabilization
    "B": [("E02", 1.0), ("E03", 1.0), ("I09", -1.0)],  # Leapfrog-Capable
    "C": [("X04", -1.0), ("S03", 1.0), ("T02", -1.0)], # Infrastructure-Constrained
    "D": [("G02", 1.0), ("G03", 1.0)],                 # Fragile/Conflict-Affected
    "E": [("S01", 1.0), ("T01", 1.0)],                 # Advanced Emerging
}

SOFTMAX_TEMPERATURE = 0.15


def _archetype_score(parameters: dict, letter: str) -> float:
    signals = ARCHETYPE_SIGNALS[letter]
    total = 0.0
    count = 0
    for key, weight in signals:
        value = parameters.get(key)
        if value is None:
            continue
        total += (value if weight > 0 else (1.0 - value))
        count += 1
    return total / count if count else 0.0


def _softmax(scores: list[float]) -> list[float]:
    scaled = [s / SOFTMAX_TEMPERATURE for s in scores]
    m = max(scaled)
    exps = [math.exp(s - m) for s in scaled]
    total = sum(exps)
    return [e / total for e in exps]


def assign_clusters(countries: list[dict]) -> dict[str, dict]:
    """countries: list of {"id", "parameters"} dicts.

    Returns {country_id: {"cluster_label": str, "cluster_probabilities": {letter: prob}}}
    """
    results: dict[str, dict] = {}
    for c in countries:
        scores = [_archetype_score(c["parameters"], letter) for letter in CLUSTER_LETTERS]
        probs = _softmax(scores)
        prob_by_letter = {
            letter: round(p, 4) for letter, p in zip(CLUSTER_LETTERS, probs)
        }
        top_letter = max(prob_by_letter, key=prob_by_letter.get)
        results[c["id"]] = {
            "cluster_label": top_letter,
            "cluster_probabilities": prob_by_letter,
        }
    return results
