from sqlalchemy import Boolean, ForeignKey, Numeric, SmallInteger, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    name_zh: Mapped[str | None] = mapped_column(String(100), nullable=True)
    iso_code: Mapped[str] = mapped_column(String(3), unique=True)
    region: Mapped[str | None] = mapped_column(String(50), nullable=True)
    parameters: Mapped[dict] = mapped_column(JSONB)
    cluster_label: Mapped[str | None] = mapped_column(String(1), nullable=True)
    cluster_probabilities: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    policy_gate = relationship("PolicyGate", back_populates="country", uselist=False)


class Solution(Base):
    __tablename__ = "solutions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True)
    tier: Mapped[int] = mapped_column(SmallInteger)
    supplier: Mapped[str | None] = mapped_column(String(150), nullable=True)
    capex_low_usd_m: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    capex_high_usd_m: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    l_vector: Mapped[dict] = mapped_column(JSONB)
    f_vector: Mapped[dict] = mapped_column(JSONB)


class PolicyGate(Base):
    __tablename__ = "policy_gates"

    id: Mapped[int] = mapped_column(primary_key=True)
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id", ondelete="CASCADE"), unique=True)
    gates: Mapped[dict] = mapped_column(JSONB)

    country = relationship("Country", back_populates="policy_gate")


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True)
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id", ondelete="CASCADE"))
    solution_id: Mapped[int] = mapped_column(ForeignKey("solutions.id", ondelete="CASCADE"))
    cosine_sim: Mapped[float] = mapped_column(Numeric(5, 4))
    cluster_fit: Mapped[float] = mapped_column(Numeric(5, 4))
    policy_score: Mapped[float] = mapped_column(Numeric(5, 4))
    risk_adj: Mapped[float] = mapped_column(Numeric(5, 4))
    match_score: Mapped[float] = mapped_column(Numeric(5, 4))
