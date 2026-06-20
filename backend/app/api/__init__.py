from fastapi import APIRouter
from app.api import validators, staking, oro, users, ai

router = APIRouter()

router.include_router(validators.router, prefix="/validators", tags=["validators"])
router.include_router(staking.router, prefix="/staking", tags=["staking"])
router.include_router(oro.router, prefix="/oro", tags=["oro"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
