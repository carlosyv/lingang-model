# Data Model

See `database/init/schema.sql` for the authoritative DDL.

## `countries`

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | text | unique |
| iso_code | char(3) | unique, e.g. `DZA` |
| parameters | jsonb | 68-key S/C/I/T/E/G/X/R vector, values normalized to [0,1] |
| cluster_label | char(1) | A–E, set by the clustering service |
| cluster_probabilities | jsonb | `{"A": 0.75, "B": 0.15, ...}`, sums to 1.0 |

Parameter key convention: `<block><index>`, e.g. `S01` = GDP/capita (PPP), `E02`/`E03`
= solar/wind potential, `G01` = political stability (WGI). Block sizes match the
deck: S=10, C=8, I=10, T=8, E=9, G=10, X=8, R=15 (68 total).

## `solutions`

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | text | unique, e.g. "Blue H2 + CCUS" |
| tier | smallint | 1–4, per the deck's solution tiers |
| supplier | text | e.g. "CATL", "LONGi Green Energy" |
| capex_low_usd_m / capex_high_usd_m | numeric | CAPEX range in USD millions |
| l_vector | jsonb | `L01`–`L10` solution vector, used for cosine similarity |
| f_vector | jsonb | `F01`–`F13` supplier company vector (tech readiness, production capacity, min order volume, export experience, localization, financial health, R&D intensity, after-sales network, supply chain integration, ESG rating, IP portfolio, political risk tolerance, Lin-Gang FTZ registration status) — used by the Layer 2 supplier gate |

## `policy_gates`

One row per country: `gates` jsonb holds policy flags used by the hard policy gate —
`PO01` (FTZ tariff active), `PO05` (AI platform export tier, <2 blocks), `PO09`
(Carbon Bridge enabled), `PO10` (export license pre-clearance flag), `PO19` (BIT
depth 0–3), `PO20` (FTA depth 0–4), `PO21` (sanctions exposure 0–3; >=2 eliminates),
plus a minimal operational subset `CP01` (EIA requirement level 0–3) and `CP03`
(export control cleared, 0/1).

## `matches`

Cached output of the matching pipeline per (country, solution) pair for **ranked**
(non-eliminated) pairs only: `cosine_sim`, `cluster_fit`, `policy_score`, `risk_adj`,
`match_score`. Recomputed and upserted each time `GET /countries/{id}/matches` is
called. Eliminated pairs are *not* persisted — they're recomputed and returned as the
`excluded` list in the API response each time.

## Seed data

`datasets/seed/countries.json` and `datasets/seed/solutions.json` are the source of
truth for the MVP's fixture data (5 countries — Algeria, Morocco, Kenya, Egypt, Chile —
and 8 representative solutions across the 4 tiers, each with an L-block and F-block
vector). Loaded idempotently by `database/init/seed.py` (upsert on `iso_code` /
`name`). One solution (Green Hydrogen Electrolyzers) is seeded with `F13=0` to
demonstrate the supplier-gate elimination path; Blue H2+CCUS has `F01=0.55` to
demonstrate the flag-for-review path.
