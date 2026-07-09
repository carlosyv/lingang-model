# API

Base URL (local): `http://localhost:8010` (see `.env`). Interactive docs at `/docs` (Swagger UI).

## `GET /health`

Liveness check. Returns `{"status": "ok"}`.

## `GET /countries`

List all seeded countries with their cluster assignment. Triggers cluster assignment
on first call if not yet computed.

## `GET /countries/{id}`

Single country detail (same shape as list item).

## `GET /solutions`

List the solution catalog (name, tier, supplier, CAPEX range, F-block vector).

## `GET /countries/{id}/matches`

Returns `{"ranked": [...], "excluded": [...]}`.

- **`ranked`** — PROCEED and FLAG_FOR_REVIEW pairs, sorted by `match_score`
  descending. Each entry includes the solution, the four Match_Score components
  (`cosine_sim`, `cluster_fit`, `policy_score`, `risk_adj`), `viable` (true when
  `cosine_sim > 0.65`), `gate` (`PROCEED` or `FLAG_FOR_REVIEW`), and `gate_reasons`
  (non-blocking notes, e.g. low BIT/FTA depth, low tech readiness).
- **`excluded`** — ELIMINATEd pairs (same shape, `gate` = `ELIMINATE`), e.g. a
  country with sanctions exposure `PO21 >= 2`, or a solution whose supplier isn't
  Lin-Gang FTZ registered (`F13 = 0`). These are computed but not persisted.

The policy/supplier gate logic is a hard filter — see
[architecture.md](architecture.md) for the exact rules.

## `POST /admin/recompute`

Re-runs cluster assignment for all countries. Useful after editing seed data.
