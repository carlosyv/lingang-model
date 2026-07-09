from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.orm import Country, Solution
from app.schemas.api import CountryOut, MatchesResponse, SolutionOut
from app.services.pipeline import compute_country_matches, recompute_clusters

router = APIRouter()


@router.get("/countries", response_model=list[CountryOut])
def list_countries(db: Session = Depends(get_db)):
    countries = db.execute(select(Country)).scalars().all()
    if countries and any(c.cluster_label is None for c in countries):
        recompute_clusters(db)
        countries = db.execute(select(Country)).scalars().all()
    return countries


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
