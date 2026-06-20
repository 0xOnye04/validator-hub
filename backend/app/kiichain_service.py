
import httpx
from typing import List, Dict, Any

# KiiChain public endpoints
KIICHAIN_RPC = "https://rpc.kiichain.nodestake.org"
KIICHAIN_API = "https://api.kiichain.nodestake.org"


async def get_latest_block_height() -> int:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{KIICHAIN_RPC}/status")
        data = response.json()
        return int(data["result"]["sync_info"]["latest_block_height"])


async def get_validators() -> List[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        # Get validators from staking module
        response = await client.get(f"{KIICHAIN_API}/cosmos/staking/v1beta1/validators")
        data = response.json()
        validators = data.get("validators", [])
        
        # Get latest block height
        height = await get_latest_block_height()
        
        # Get validators from RPC for voting power
        rpc_response = await client.get(f"{KIICHAIN_RPC}/validators", params={"height": height, "per_page": 100})
        rpc_data = rpc_response.json()
        rpc_validators = rpc_data.get("result", {}).get("validators", [])
        
        # Merge data
        result = []
        for val in validators:
            val_addr = val["operator_address"]
            # Find corresponding RPC validator
            rpc_val = next((v for v in rpc_validators if v["address"] == val_addr), None)
            result.append({
                "validator_address": val_addr,
                "moniker": val["description"]["moniker"],
                "height": height,
                "voting_power": int(rpc_val["voting_power"]) if rpc_val else 0,
                "missed_blocks": 0,  # We'll need slashing module for this
                "is_active": val["status"] == "BOND_STATUS_BONDED"
            })
        return result


async def get_staking_metrics() -> List[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{KIICHAIN_API}/cosmos/staking/v1beta1/validators")
        data = response.json()
        validators = data.get("validators", [])
        
        result = []
        for val in validators:
            result.append({
                "validator_address": val["operator_address"],
                "total_staked": int(val["tokens"]),
                "self_staked": int(val["tokens"]) // 2,  # Estimate
                "delegators_count": 100,  # Will need another endpoint
                "commission_rate": float(val["commission"]["commission_rates"]["rate"])
            })
        return result


async def get_oro_ranks() -> List[Dict[str, Any]]:
    # For ORO ranks, let's just use staking order for now
    validators = await get_validators()
    result = []
    for i, val in enumerate(validators):
        result.append({
            "validator_address": val["validator_address"],
            "rank": i + 1,
            "score": 100 - (i * 2)
        })
    return result
