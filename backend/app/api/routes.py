from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.orm import Country, Solution
from app.schemas.api import CountryCreate, CountryOut, MatchesResponse, SolutionOut
from app.services.pipeline import compute_country_matches, recompute_clusters

router = APIRouter()


def _derive_iso_code(db: Session, name: str) -> str:
    letters = "".join(ch for ch in name.upper() if ch.isalpha())
    base = (letters + "XXX")[:3]
    candidate = base
    suffix = 1
    existing = {c[0] for c in db.execute(select(Country.iso_code)).all()}
    while candidate in existing:
        candidate = f"{base[:2]}{suffix}"
        suffix += 1
    return candidate


def _estimate_parameters(db: Session) -> dict[str, float]:
    countries = db.execute(select(Country)).scalars().all()
    if not countries:
        return {}
    sums: dict[str, float] = {}
    counts: dict[str, int] = {}
    for c in countries:
        for key, value in (c.parameters or {}).items():
            sums[key] = sums.get(key, 0.0) + value
            counts[key] = counts.get(key, 0) + 1
    return {key: round(sums[key] / counts[key], 4) for key in sums}


@router.get("/countries", response_model=list[CountryOut])
def list_countries(db: Session = Depends(get_db)):
    countries = db.execute(select(Country)).scalars().all()
    if countries and any(c.cluster_label is None for c in countries):
        recompute_clusters(db)
        countries = db.execute(select(Country)).scalars().all()
    return countries


@router.post("/countries", response_model=CountryOut, status_code=201)
def create_country(payload: CountryCreate, db: Session = Depends(get_db)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Country name is required")

    existing = db.execute(select(Country).where(Country.name == name)).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Country already exists")

    country = Country(
        name=name,
        iso_code=_derive_iso_code(db, name),
        region=payload.region,
        parameters=_estimate_parameters(db),
        is_new=True,
    )
    db.add(country)
    db.commit()
    db.refresh(country)

    recompute_clusters(db)
    compute_country_matches(db, country.id)
    db.refresh(country)
    return country


@router.get("/countries/{country_id}", response_model=CountryOut)
def get_country(country_id: int, db: Session = Depends(get_db)):
    country = db.get(Country, country_id)
    if country is None:
        raise HTTPException(status_code=404, detail="Country not found")
    return country


@router.get("/solutions", response_model=list[SolutionOut])
def list_solutions(db: Session = Depends(get_db)):
    return db.execute(select(Solution)).scalars().all()


@router.get("/countries/{country_id}/matches", response_model=MatchesResponse)
def get_country_matches(country_id: int, db: Session = Depends(get_db)):
    matches = compute_country_matches(db, country_id)
    if matches is None:
        raise HTTPException(status_code=404, detail="Country not found")
    return matches


@router.post("/admin/recompute")
def recompute(db: Session = Depends(get_db)):
    recompute_clusters(db)
    return {"status": "ok"}
