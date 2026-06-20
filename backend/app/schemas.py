from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Validator Metrics
class ValidatorMetricsBase(BaseModel):
    validator_address: str
    moniker: str
    height: int
    voting_power: int
    missed_blocks: int = 0
    is_active: bool = True

class ValidatorMetricsCreate(ValidatorMetricsBase):
    pass

class ValidatorMetricsResponse(ValidatorMetricsBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Staking Metrics
class StakingMetricsBase(BaseModel):
    validator_address: str
    total_staked: int
    self_staked: int
    delegators_count: int
    commission_rate: float

class StakingMetricsCreate(StakingMetricsBase):
    pass

class StakingMetricsResponse(StakingMetricsBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# ORO Rank
class ORORankBase(BaseModel):
    validator_address: str
    rank: int
    score: float

class ORORankCreate(ORORankBase):
    pass

class ORORankResponse(ORORankBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# User
class UserBase(BaseModel):
    wallet_address: str
    email: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
