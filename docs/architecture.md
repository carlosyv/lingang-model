# Architecture

## Scope

This is an MVP of the Lin-Gang Global Energy Transition Gateway framework, built from
the 45-page `DRAFT Lin_Gang_Framework_Presentation_013449(1).pdf` deck (the
authoritative spec — it supersedes the earlier `LinGang_Framework_Summary.md`). It
implements the core matching pipeline — country profiling, cluster assignment, hard
policy/supplier gates, and cosine-similarity matching — on seeded, static data.

**Explicitly out of scope for this MVP** (deferred to a future phase):
- Live external data feeds (World Bank, IEA, IMF, UN, USGS, Hofstede, ND-GAIN, LME, etc.)
- The five real-time AI risk sub-models (EGDT risk scorer, SDP transition speed,
  Monte Carlo supply-chain disruption, carbon credit valuation, price Jacobian
  sensitivity matrix) — replaced by one simplified composite risk score
  (`backend/app/services/risk.py`)
- The XGBoost (supplier, country) classifier — replaced by reusing the archetype
  membership probability as `cluster_fit`
- Layer 4 (CAPEX recomputation against live resource prices, RP01–RP15, price
  Jacobian, NLP shock detection)
- The full PO-II operational layer (39 LP/TX/HR/CP parameters) — only a minimal
  CP01 (EIA level) / CP03 (export control) subset is included, as non-blocking notes
- Full 8-node supply chain routing / Monte Carlo disruption simulation
- Kubernetes, CI/CD, and cloud deployment (Docker Compose only, for local use)

## Services

```
┌─────────────┐      ┌──────────────────┐      ┌────────────┐
│  frontend    │─────▶│  backend (FastAPI)│─────▶│ db (Postgres)│
│  React+Vite  │      │  clustering +      │      │              │
│              │      │  matching services │      │              │
└─────────────┘      └──────────────────┘      └────────────┘
```

- **backend** seeds the database on container start (`database/init/seed.py`), then
  serves a REST API (`app/main.py`, `app/api/routes.py`).
- **Cluster assignment** (`app/services/clustering.py`) scores each country against
  the archetype signal parameters from the deck's cluster taxonomy (e.g. cluster A
  signals on `S10`, `G05`, `I09`) and converts the five archetype scores into a
  soft-membership probability distribution via softmax — a lightweight,
  dependency-free stand-in for the deck's Ward's-linkage + GMM clustering, chosen so
  the backend image doesn't need numpy/scipy/scikit-learn.
- **Matching** (`app/services/matching.py`) implements the deck's Layer 2 (Supplier
  Feasibility) and Layer 3 (Policy Alignment) as **hard gates**, not soft credit:
  - *Policy gate*: `PO21 (sanctions) >= 2 → ELIMINATE`; `PO19 (BIT)=0 AND PO20 (FTA)=0
    → FLAG_FOR_REVIEW`; else `PROCEED` — the exact rule from the deck's policy gate box.
  - *Supplier gate*: over each solution's F-block vector (F01–F13, company
    capability/capacity/certification) — `F13=0` (not Lin-Gang FTZ registered) →
    `ELIMINATE`; `F01<0.6` (low tech readiness) → `FLAG_FOR_REVIEW`; else `PROCEED`.
  - The combined gate (worse of the two) determines whether a pair is ranked or
    excluded. `policy_score` in the `Match_Score` formula is derived from the gate
    (PROCEED=1.0, FLAG_FOR_REVIEW=0.5, ELIMINATE=0.0).
  - Country parameters are projected into the same 10-dim L-space used by solution
    vectors (a fixed mapping — see `COUNTRY_TO_L_KEY`) for cosine similarity, then
    combined with cluster fit, policy score, and risk adjustment into `Match_Score`,
    per the deck's formula. Threshold `sim > 0.65` flags "viable."
- **frontend** is a single-page dashboard: pick a country, see its cluster, ranked
  (PROCEED/FLAG_FOR_REVIEW) matches with gate reasons, and a collapsible list of
  ELIMINATEd solutions with their reasons.

## Data flow

1. On backend startup, `entrypoint.sh` runs `seed.py`, which applies `schema.sql` and
   loads `datasets/seed/countries.json` + `solutions.json` into Postgres.
2. First call to `GET /countries` (or `POST /admin/recompute`) triggers cluster
   assignment for all countries and persists `cluster_label` / `cluster_probabilities`.
3. `GET /countries/{id}/matches` computes match scores and gate status against all
   solutions on the fly, caches ranked (non-eliminated) results in the `matches`
   table, and returns `{"ranked": [...], "excluded": [...]}`.

## Future work (Phase 2+)

- Wire live data connectors for the socio-economic/industrial/environmental blocks.
- Replace the composite risk score with the five dedicated sub-models.
- Add the full PO-II operational layer (LP/TX/HR, 39 params) as a post-Layer-3 filter.
- Add Layer 4 CAPEX recomputation against live resource prices (RP01–RP15) with
  Jacobian sensitivity and NLP-based shock detection.
- Add Kubernetes manifests, CI/CD pipeline, and cloud deployment target.
- Expand seed set from 5 countries / 8 solutions to the full 20+ country / 18 solution
  catalog.
