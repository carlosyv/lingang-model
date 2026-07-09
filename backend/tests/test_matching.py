import json
from pathlib import Path

import pytest

from app.services.clustering import assign_clusters
from app.services.matching import compute_matches

def _find_seed_dir() -> Path:
    here = Path(__file__).resolve().parent
    for candidate in (here.parent / "datasets" / "seed", here.parent.parent / "datasets" / "seed"):
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Could not locate datasets/seed directory")


SEED_DIR = _find_seed_dir()


@pytest.fixture
def countries():
    data = json.loads((SEED_DIR / "countries.json").read_text())
    return [{"id": i, **c} for i, c in enumerate(data, start=1)]


@pytest.fixture
def solutions():
    data = json.loads((SEED_DIR / "solutions.json").read_text())
    return [{"id": i, **s} for i, s in enumerate(data, start=1)]


def test_assign_clusters_returns_probabilities_for_all_countries(countries):
    payload = [{"id": c["id"], "parameters": c["parameters"]} for c in countries]
    result = assign_clusters(payload)

    assert len(result) == len(countries)
    for c in countries:
        entry = result[c["id"]]
        assert entry["cluster_label"] in {"A", "B", "C", "D", "E"}
        probs = entry["cluster_probabilities"]
        assert abs(sum(probs.values()) - 1.0) < 1e-3


def test_algeria_assigned_export_stabilization_cluster(countries):
    payload = [{"id": c["id"], "parameters": c["parameters"]} for c in countries]
    result = assign_clusters(payload)
    algeria = next(c for c in countries if c["name"] == "Algeria")
    assert result[algeria["id"]]["cluster_label"] == "A"


def test_compute_matches_ranks_and_scores(countries, solutions):
    payload = [{"id": c["id"], "parameters": c["parameters"]} for c in countries]
    clusters = assign_clusters(payload)

    algeria = next(c for c in countries if c["name"] == "Algeria")
    country_payload = {
        "parameters": algeria["parameters"],
        "cluster_probabilities": clusters[algeria["id"]]["cluster_probabilities"],
        "policy_gates": algeria["policy_gates"],
    }
    solution_payload = [
        {"id": s["id"], "l_vector": s["l_vector"], "f_vector": s["f_vector"]} for s in solutions
    ]

    results = compute_matches(country_payload, solution_payload)

    assert len(results["ranked"]) + len(results["excluded"]) == len(solutions)
    scores = [r["match_score"] for r in results["ranked"]]
    assert scores == sorted(scores, reverse=True)
    for r in results["ranked"] + results["excluded"]:
        assert 0.0 <= r["match_score"] <= 1.0
        assert 0.0 <= r["cosine_sim"] <= 1.0
        assert r["gate"] in {"PROCEED", "FLAG_FOR_REVIEW", "ELIMINATE"}
    for r in results["excluded"]:
        assert r["gate"] == "ELIMINATE"
        assert r["gate_reasons"]


def test_supplier_not_ftz_registered_is_excluded(countries, solutions):
    payload = [{"id": c["id"], "parameters": c["parameters"]} for c in countries]
    clusters = assign_clusters(payload)

    algeria = next(c for c in countries if c["name"] == "Algeria")
    country_payload = {
        "parameters": algeria["parameters"],
        "cluster_probabilities": clusters[algeria["id"]]["cluster_probabilities"],
        "policy_gates": algeria["policy_gates"],
    }
    solution_payload = [
        {"id": s["id"], "l_vector": s["l_vector"], "f_vector": s["f_vector"]} for s in solutions
    ]

    results = compute_matches(country_payload, solution_payload)
    excluded_names = {
        next(s["name"] for s in solutions if s["id"] == r["solution_id"])
        for r in results["excluded"]
    }
    assert "Green Hydrogen Electrolyzers" in excluded_names


def test_sanctions_gate_eliminates_all_solutions(countries, solutions):
    payload = [{"id": c["id"], "parameters": c["parameters"]} for c in countries]
    clusters = assign_clusters(payload)

    egypt = next(c for c in countries if c["name"] == "Egypt")
    country_payload = {
        "parameters": egypt["parameters"],
        "cluster_probabilities": clusters[egypt["id"]]["cluster_probabilities"],
        "policy_gates": {**egypt["policy_gates"], "PO21": 2},
    }
    solution_payload = [
        {"id": s["id"], "l_vector": s["l_vector"], "f_vector": s["f_vector"]} for s in solutions
    ]

    results = compute_matches(country_payload, solution_payload)
    assert len(results["ranked"]) == 0
    assert len(results["excluded"]) == len(solutions)
    assert all(r["gate"] == "ELIMINATE" for r in results["excluded"])
