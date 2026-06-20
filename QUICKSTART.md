# KiiChain Validator Hub - Quick Start

## Prerequisites (Install These First!)

Before running the project, you need:

1. **Node.js 20+**: https://nodejs.org/
2. **Python 3.12+**: https://www.python.org/downloads/
3. **Docker Desktop** (optional but recommended): https://www.docker.com/products/docker-desktop/

---

## Option 1: Run with Docker (Recommended)

If you have Docker installed:

1. **Start Docker Desktop**
2. **Open a terminal in the project directory**:
   ```powershell
   cd c:\Users\User2\Desktop\kiichain-validator-hub
   ```
3. **Start all services**:
   ```powershell
   docker compose up -d
   ```

Then open:
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs

---

## Option 2: Run Locally (Without Docker)

### Backend Setup
1. **Open a terminal in the backend directory**:
   ```powershell
   cd c:\Users\User2\Desktop\kiichain-validator-hub\backend
   ```

2. **Create a virtual environment**:
   - **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux/macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. **Open a **new terminal** in the frontend directory**:
   ```powershell
   cd c:\Users\User2\Desktop\kiichain-validator-hub\frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend**:
   ```bash
   npm run dev
   ```

---

## Project Structure
```
kiichain-validator-hub/
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
├── docs/             # Documentation
└── docker-compose.yml
```
