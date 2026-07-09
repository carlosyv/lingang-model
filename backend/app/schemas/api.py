from pydantic import BaseModel, ConfigDict


class CountryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    iso_code: str
    region: str | None
    parameters: dict[str, float] | None
    cluster_label: str | None
    cluster_probabilities: dict[str, float] | None


class SolutionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tier: int
    supplier: str | None
    capex_low_usd_m: float | None
    capex_high_usd_m: float | None
    f_vector: dict[str, float] | None = None


class MatchOut(BaseModel):
    solution: SolutionOut
    cosine_sim: float
    cluster_fit: float
    policy_score: float
    risk_adj: float
    match_score: float
    viable: bool
    gate: str
    gate_reasons: list[str]


class MatchesResponse(BaseModel):
    ranked: list[MatchOut]
    excluded: list[MatchOut]
