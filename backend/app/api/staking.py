from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.kiichain_service import get_staking_metrics as fetch_kiichain_staking
from app.schemas import StakingMetricsResponse
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[StakingMetricsResponse])
async def get_staking_metrics(
    skip: int = 0,
    limit: int = 100,
    validator_address: Optional[str] = None
):
    try:
        metrics = await fetch_kiichain_staking()
        
        # Filter if needed
        if validator_address:
            metrics = [m for m in metrics if m["validator_address"] == validator_address]
        
        # Apply pagination
        metrics = metrics[skip : skip + limit]
        
        # Convert to response model
        result = []
        for m in metrics:
            result.append({
                "id": 0,
                "validator_address": m["validator_address"],
                "total_staked": m["total_staked"],
                "self_staked": m["self_staked"],
                "delegators_count": m["delegators_count"],
                "commission_rate": m["commission_rate"],
                "timestamp": datetime.now()
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{validator_address}", response_model=StakingMetricsResponse)
async def get_staking_metric(validator_address: str):
    try:
        metrics = await fetch_kiichain_staking()
        metric = next((m for m in metrics if m["validator_address"] == validator_address), None)
        
        if not metric:
            raise HTTPException(status_code=404, detail="Staking metrics not found")
        
        return {
            "id": 0,
            "validator_address": metric["validator_address"],
            "total_staked": metric["total_staked"],
            "self_staked": metric["self_staked"],
            "delegators_count": metric["delegators_count"],
            "commission_rate": metric["commission_rate"],
            "timestamp": datetime.now()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
