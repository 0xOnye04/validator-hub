# Development Guide

## Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- PostgreSQL 16 (optional, if not using Docker)

## Backend Setup

### 1. Create virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up environment

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://kiichain:kiichain_password@localhost:5432/kiichain_validator_hub
KII_NODE_RPC=http://localhost:26657
KII_NODE_API=http://localhost:1317
```

### 4. Run backend

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run frontend

```bash
npm run dev
```

Frontend available at: http://localhost:3000

## Database Setup (Local)

If not using Docker Compose:

```bash
# Start PostgreSQL
docker run -d \
  --name kiichain-postgres \
  -e POSTGRES_USER=kiichain \
  -e POSTGRES_PASSWORD=kiichain_password \
  -e POSTGRES_DB=kiichain_validator_hub \
  -p 5432:5432 \
  postgres:16-alpine
```

## Project Structure

```
kiichain-validator-hub/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── database.py    # DB connection
│   │   └── main.py        # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```
