"""Idempotent DB schema + seed loader. Run against Postgres before starting the API."""
import json
import os
import time
from pathlib import Path

import psycopg2
from psycopg2.extras import Json

DB_DSN = os.environ.get(
    "DATABASE_URL",
    "postgresql://lingang:lingang@db:5432/lingang",
)

ROOT = Path(__file__).resolve().parent.parent.parent
SCHEMA_SQL = Path(__file__).resolve().parent / "schema.sql"
COUNTRIES_JSON = ROOT / "datasets" / "seed" / "countries.json"
SOLUTIONS_JSON = ROOT / "datasets" / "seed" / "solutions.json"


def wait_for_db(retries: int = 30, delay: float = 1.0) -> psycopg2.extensions.connection:
    last_err = None
    for _ in range(retries):
        try:
            return psycopg2.connect(DB_DSN)
        except psycopg2.OperationalError as err:
            last_err = err
            time.sleep(delay)
    raise RuntimeError(f"Could not connect to database at {DB_DSN}") from last_err


def apply_schema(conn) -> None:
    with conn.cursor() as cur:
        cur.execute(SCHEMA_SQL.read_text())
    conn.commit()


def seed_countries(conn) -> None:
    countries = json.loads(COUNTRIES_JSON.read_text())
    with conn.cursor() as cur:
        for c in countries:
            cur.execute(
                """
                INSERT INTO countries (name, iso_code, region, parameters)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (iso_code) DO UPDATE SET region = EXCLUDED.region, parameters = EXCLUDED.parameters
                RETURNING id
                """,
                (c["name"], c["iso_code"], c.get("region"), Json(c["parameters"])),
            )
            country_id = cur.fetchone()[0]
            cur.execute(
                """
                INSERT INTO policy_gates (country_id, gates)
                VALUES (%s, %s)
                ON CONFLICT (country_id) DO UPDATE SET gates = EXCLUDED.gates
                """,
                (country_id, Json(c["policy_gates"])),
            )
    conn.commit()


def seed_solutions(conn) -> None:
    solutions = json.loads(SOLUTIONS_JSON.read_text())
    with conn.cursor() as cur:
        for s in solutions:
            cur.execute(
                """
                INSERT INTO solutions (name, tier, supplier, capex_low_usd_m, capex_high_usd_m, l_vector, f_vector)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (name) DO UPDATE SET
                    tier = EXCLUDED.tier,
                    supplier = EXCLUDED.supplier,
                    capex_low_usd_m = EXCLUDED.capex_low_usd_m,
                    capex_high_usd_m = EXCLUDED.capex_high_usd_m,
                    l_vector = EXCLUDED.l_vector,
                    f_vector = EXCLUDED.f_vector
                """,
                (
                    s["name"],
                    s["tier"],
                    s["supplier"],
                    s["capex_low_usd_m"],
                    s["capex_high_usd_m"],
                    Json(s["l_vector"]),
                    Json(s["f_vector"]),
                ),
            )
    conn.commit()


def main() -> None:
    conn = wait_for_db()
    try:
        apply_schema(conn)
        seed_countries(conn)
        seed_solutions(conn)
        print("Seed complete.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
