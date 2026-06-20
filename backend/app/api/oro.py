from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.kiichain_service import get_oro_ranks as fetch_kiichain_oro
from app.schemas import ORORankResponse
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[ORORankResponse])
async def get_oro_ranks(
    skip: int = 0,
    limit: int = 100
):
    try:
        ranks = await fetch_kiichain_oro()
        
        # Apply pagination
        ranks = ranks[skip : skip + limit]
        
        # Convert to response model
        result = []
        for r in ranks:
            result.append({
                "id": 0,
                "validator_address": r["validator_address"],
                "rank": r["rank"],
                "score": r["score"],
                "timestamp": datetime.now()
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{validator_address}", response_model=ORORankResponse)
async def get_oro_rank(validator_address: str):
    try:
        ranks = await fetch_kiichain_oro()
        rank = next((r for r in ranks if r["validator_address"] == validator_address), None)
        
        if not rank:
            raise HTTPException(status_code=404, detail="ORO rank not found")
        
        return {
            "id": 0,
            "validator_address": rank["validator_address"],
            "rank": rank["rank"],
            "score": rank["score"],
            "timestamp": datetime.now()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
