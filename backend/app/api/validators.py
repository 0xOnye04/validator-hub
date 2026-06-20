from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.kiichain_service import get_validators as fetch_kiichain_validators
from app.schemas import ValidatorMetricsResponse
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[ValidatorMetricsResponse])
async def get_validators(
    skip: int = 0,
    limit: int = 100,
    validator_address: Optional[str] = None
):
    try:
        validators = await fetch_kiichain_validators()
        
        # Filter if needed
        if validator_address:
            validators = [v for v in validators if v["validator_address"] == validator_address]
        
        # Apply pagination
        validators = validators[skip : skip + limit]
        
        # Convert to response model
        result = []
        for val in validators:
            result.append({
                "id": 0,
                "validator_address": val["validator_address"],
                "moniker": val["moniker"],
                "height": val["height"],
                "voting_power": val["voting_power"],
                "missed_blocks": val["missed_blocks"],
                "is_active": val["is_active"],
                "timestamp": datetime.now()
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{validator_address}", response_model=ValidatorMetricsResponse)
async def get_validator(validator_address: str):
    try:
        validators = await fetch_kiichain_validators()
        validator = next((v for v in validators if v["validator_address"] == validator_address), None)
        
        if not validator:
            raise HTTPException(status_code=404, detail="Validator not found")
        
        return {
            "id": 0,
            "validator_address": validator["validator_address"],
            "moniker": validator["moniker"],
            "height": validator["height"],
            "voting_power": validator["voting_power"],
            "missed_blocks": validator["missed_blocks"],
            "is_active": validator["is_active"],
            "timestamp": datetime.now()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
