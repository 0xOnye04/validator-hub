# KiiChain Validator Hub

A full-stack validator node manager, monitoring system, and staking analytics dashboard for KiiChain.

## Architecture

```
kiichain-validator-hub/
├── frontend/          # Next.js frontend (dashboard, AI assistant)
├── backend/           # FastAPI backend (APIs, monitoring, DB)
├── docker/            # Docker configs
├── docs/              # Documentation
└── scripts/           # Deployment & management scripts
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts, WalletConnect
- **Backend**: FastAPI, Python 3.12, Uvicorn
- **Database**: PostgreSQL 16, SQLAlchemy
- **Deployment**: Docker, Docker Compose
- **Monitoring**: Prometheus + Grafana (optional)

## Quick Start

### With Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Open frontend at http://localhost:3000
# Open backend docs at http://localhost:8000/docs
```

### Local Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed setup.

## Features

- ✅ Validator node manager
- ✅ Real-time monitoring (uptime, block production)
- ✅ Staking analytics dashboard
- ✅ ORO rank tracker
- ✅ AI assistant for validator operations
- ✅ Wallet connection (Cosmos, Keplr, etc.)
- ✅ Authentication system
- ✅ Notifications (email, Slack, etc.)
- ✅ Historical data storage
- ✅ Comprehensive APIs
