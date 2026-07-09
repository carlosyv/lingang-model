from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://lingang:lingang@db:5432/lingang"
    match_alpha: float = 0.5   # cosine similarity weight
    match_beta: float = 0.25   # cluster fit weight
    match_gamma: float = 0.15  # policy score weight
    match_delta: float = 0.10  # risk adjustment weight
    match_threshold: float = 0.65


settings = Settings()
