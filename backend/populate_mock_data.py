from app.database import SessionLocal, engine
from app.models import Base, ValidatorMetrics, StakingMetrics, ORORank
from datetime import datetime

# Create tables
Base.metadata.create_all(bind=engine)

# Create session
db = SessionLocal()

# Mock validators
mock_validators = [
    {"validator_address": "kiivaloper1abc123def456ghi789jkl012mnop345qrs678t", "moniker": "KiiNode Pro", "height": 1234567, "voting_power": 2500000, "missed_blocks": 5, "is_active": True},
    {"validator_address": "kiivaloper1zyx987wvuts654rqpo321nmlk098jihg765fed", "moniker": "StakingMax", "height": 1234567, "voting_power": 1800000, "missed_blocks": 2, "is_active": True},
    {"validator_address": "kiivaloper1qwe456rty789uio012pas345dfg678hjk901l", "moniker": "Valid8r", "height": 1234565, "voting_power": 1500000, "missed_blocks": 0, "is_active": True},
    {"validator_address": "kiivaloper1mnb098vcb765nxc432zas123qwe456rty789u", "moniker": "ChainGuard", "height": 1234567, "voting_power": 1200000, "missed_blocks": 12, "is_active": False},
    {"validator_address": "kiivaloper1lkj321poi098uyt765rew432qaz123wsx456e", "moniker": "KiiVerse", "height": 1234567, "voting_power": 900000, "missed_blocks": 1, "is_active": True},
]

# Insert mock validator metrics
for v in mock_validators:
    vm = ValidatorMetrics(**v)
    db.add(vm)

# Mock staking metrics
mock_staking = [
    {"validator_address": "kiivaloper1abc123def456ghi789jkl012mnop345qrs678t", "total_staked": 2500000000000, "self_staked": 500000000000, "delegators_count": 1245, "commission_rate": 0.05},
    {"validator_address": "kiivaloper1zyx987wvuts654rqpo321nmlk098jihg765fed", "total_staked": 1800000000000, "self_staked": 300000000000, "delegators_count": 890, "commission_rate": 0.075},
    {"validator_address": "kiivaloper1qwe456rty789uio012pas345dfg678hjk901l", "total_staked": 1500000000000, "self_staked": 200000000000, "delegators_count": 678, "commission_rate": 0.10},
    {"validator_address": "kiivaloper1mnb098vcb765nxc432zas123qwe456rty789u", "total_staked": 1200000000000, "self_staked": 100000000000, "delegators_count": 456, "commission_rate": 0.08},
    {"validator_address": "kiivaloper1lkj321poi098uyt765rew432qaz123wsx456e", "total_staked": 900000000000, "self_staked": 150000000000, "delegators_count": 345, "commission_rate": 0.06},
]

for s in mock_staking:
    sm = StakingMetrics(**s)
    db.add(sm)

# Mock ORO ranks
mock_oro = [
    {"validator_address": "kiivaloper1abc123def456ghi789jkl012mnop345qrs678t", "rank": 1, "score": 98.5},
    {"validator_address": "kiivaloper1qwe456rty789uio012pas345dfg678hjk901l", "rank": 2, "score": 96.2},
    {"validator_address": "kiivaloper1zyx987wvuts654rqpo321nmlk098jihg765fed", "rank": 3, "score": 94.8},
    {"validator_address": "kiivaloper1lkj321poi098uyt765rew432qaz123wsx456e", "rank": 4, "score": 91.3},
    {"validator_address": "kiivaloper1mnb098vcb765nxc432zas123qwe456rty789u", "rank": 5, "score": 85.0},
]

for o in mock_oro:
    orm = ORORank(**o)
    db.add(orm)

db.commit()
db.close()

print("Mock data added successfully!")
