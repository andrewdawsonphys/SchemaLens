# Copilot Instructions for SchemaLens

## Overview
SchemaLens is a toolkit for exploring, visualizing, and understanding PostgreSQL data schemas. It consists of a FastAPI backend (Python) and a React-based frontend, both containerized and orchestrated via Docker Compose. The system is designed for rapid schema introspection, relationship mapping, and actionable recommendations.

## Architecture
- **Backend (API)**: FastAPI app in `schemalens/apps/api/app/` exposes endpoints for schema, relationships, and recommendations. Connects to a PostgreSQL container using environment variables. Key files: `main.py`, `crud.py`, `models.py`, `recommendation_engine/engine.py`.
- **Frontend (Web)**: React app in `schemalens/apps/web/` visualizes schemas and relationships using @xyflow/react and dagre for layout. Key files: `src/layout_handler.jsx`, `src/schema_utils.jsx`, `src/components/ErdNode.jsx`.
- **Infrastructure**: Docker Compose in `schemalens/infra/docker-compose.yml` runs `postgres`, `api`, and `web` services. Volumes persist DB data.

## Developer Workflows
- **Start all services**: From repo root, run:
  ```bash
  docker compose -f schemalens/infra/docker-compose.yml up --build
  ```
- **Stop all services**:
  ```bash
  docker compose -f schemalens/infra/docker-compose.yml down
  ```
- **Local development**: Edit code in `apps/api` or `apps/web` and containers will auto-reload (volumes are mounted).
- **Frontend dev only**: In `apps/web`, use `npm run dev` to start Vite server on port 5173.
- **Backend dev only**: In `apps/api`, use `uvicorn app.main:app --reload` (Python 3.12+ required).

## Project Conventions & Patterns
- **API endpoints**: All under `/api/v1/` (see `main.py`).
- **Database access**: Use `psycopg` and environment-driven DSN (see `crud.py`).
- **Schema/relationship mapping**: See `get_db_schema` and `get_db_relationships` in `crud.py`.
- **Recommendations**: Add new rules in `recommendation_engine/engine.py` by subclassing `RecommendationRule`.
- **Frontend schema loading**: Use `load_schema` in `src/schema_utils.jsx`.
- **Node/edge layout**: Managed by `LayoutHandler` in `src/layout_handler.jsx` using dagre.
- **React Flow**: Custom node/edge components in `src/components/`.

## Integration Points
- **API <-> DB**: All DB access via environment-configured PostgreSQL (see Compose and `crud.py`).
- **Web <-> API**: Frontend fetches from `http://localhost:8000/api/v1/` (see `API_BASE_URL` in `schema_utils.jsx`).

## Examples
- To add a new recommendation rule, create a new class in `recommendation_engine/engine.py` inheriting from `RecommendationRule` and implement `check()`.
- To add a new API endpoint, define it in `main.py` and implement logic in a separate module if complex.
- To customize frontend node rendering, edit `ErdNode.jsx`.

## Key Files/Dirs
- `schemalens/infra/docker-compose.yml` — Service orchestration
- `schemalens/apps/api/app/` — FastAPI backend
- `schemalens/apps/web/src/` — React frontend

---
For more, see the root `README.md` and code comments in key modules.
