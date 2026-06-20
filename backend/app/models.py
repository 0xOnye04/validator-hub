from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, BigInteger
from sqlalchemy.sql import func
from app.database import Base

class ValidatorMetrics(Base):
    __tablename__ = "validator_metrics"

    id = Column(Integer, primary_key=True, index=True)
    validator_address = Column(String, index=True)
    moniker = Column(String)
    height = Column(BigInteger)
    voting_power = Column(BigInteger)
    missed_blocks = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class StakingMetrics(Base):
    __tablename__ = "staking_metrics"

    id = Column(Integer, primary_key=True, index=True)
    validator_address = Column(String, index=True)
    total_staked = Column(BigInteger)
    self_staked = Column(BigInteger)
    delegators_count = Column(Integer)
    commission_rate = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class ORORank(Base):
    __tablename__ = "oro_ranks"

    id = Column(Integer, primary_key=True, index=True)
    validator_address = Column(String, index=True)
    rank = Column(Integer)
    score = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
