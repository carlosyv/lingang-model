-- Lin-Gang MVP schema

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    iso_code CHAR(3) NOT NULL UNIQUE,
    region VARCHAR(50),
    parameters JSONB NOT NULL,           -- normalized S/C/I/T/E/G/X/R vector (68 keys)
    cluster_label CHAR(1),               -- A-E, set after clustering runs
    cluster_probabilities JSONB,         -- {"A": 0.75, "B": 0.15, ...}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    tier SMALLINT NOT NULL CHECK (tier BETWEEN 1 AND 4),
    supplier VARCHAR(150),
    capex_low_usd_m NUMERIC(10, 2),
    capex_high_usd_m NUMERIC(10, 2),
    l_vector JSONB NOT NULL,             -- L01-L10
    f_vector JSONB NOT NULL,             -- F01-F13, supplier company capability/capacity/certification vector
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_gates (
    id SERIAL PRIMARY KEY,
    country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE UNIQUE,
    gates JSONB NOT NULL                 -- {"PO01": 1, "PO09": 1, "PO19": 2, "PO20": 2, "PO21": 0, "CP01": 2, "CP03": 1, ...}
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    solution_id INTEGER NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
    cosine_sim NUMERIC(5, 4) NOT NULL,
    cluster_fit NUMERIC(5, 4) NOT NULL,
    policy_score NUMERIC(5, 4) NOT NULL,
    risk_adj NUMERIC(5, 4) NOT NULL,
    match_score NUMERIC(5, 4) NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (country_id, solution_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_country ON matches(country_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(match_score DESC);

ALTER TABLE countries ADD COLUMN IF NOT EXISTS region VARCHAR(50);
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT false;
