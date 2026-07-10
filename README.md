# Lin-Gang Ai-Powered Platform — MVP

A dockerized, locally-runnable MVP of the Lin-Gang Global Energy Transition Gateway
framework: country cluster assignment (Gaussian Mixture Model) and AI-driven solution
matching (cosine similarity + policy gates + risk scoring), on seeded data for 5
countries and 8 clean-energy solutions.

See [docs/architecture.md](docs/architecture.md) for what's in scope vs. deferred.

## Quickstart

```bash
cp .env.example .env
docker compose up --build
```

- Backend API: http://localhost:8000 (docs at `/docs`)
- Frontend dashboard: http://localhost:5173

The backend seeds Postgres automatically on first boot.

## Project layout

```
backend/     FastAPI service — clustering & matching engine
frontend/    React + Vite dashboard
database/    Postgres schema + seed loader
datasets/    Seed fixtures (countries, solutions)
docs/        Architecture, data model, API reference
```

## Running backend tests

```bash
cd backend
pip install -r requirements.txt
PYTHONPATH=. pytest
```

## Architecture

```
┌──────────────────────┐
│      frontend        │
│    React + Vite      │
│  (dashboard, :5173)  │
└──────────┬───────────┘
           │ REST (JSON)
           ▼
┌──────────────────────┐
│       backend         │
│   FastAPI (:8000)     │
│ ┌───────────────────┐ │
│ │  clustering.py    │ │  archetype scoring → softmax
│ │  matching.py      │ │  policy/supplier gates + cosine similarity
│ │  risk.py          │ │  composite risk score
│ └───────────────────┘ │
└──────────┬───────────┘
           │ SQL
           ▼
┌──────────────────────┐
│      database          │
│  Postgres              │
│  (schema.sql + seed)   │
└──────────────────────┘
           ▲
           │ seeded from
┌──────────────────────┐
│      datasets           │
│  countries.json         │
│  solutions.json         │
└──────────────────────┘
```

See [docs/architecture.md](docs/architecture.md) for the full data flow and design decisions.

## License

Copyright © 2026 Carlos Yalta. All rights reserved.

This code is proprietary. No permission is granted to use, copy, modify, or
distribute it without prior explicit written permission from the copyright
holder. See [LICENSE](LICENSE) for full terms.
