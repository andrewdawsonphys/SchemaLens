# SchemaLens

![Schema Lens Banner](images/schemalens-banner.svg "Schema Lens Banner")


SchemaLens is a lightweight toolkit for exploring, visualizing, and understanding data schemas.

## Current Status

![Current status](images/current_status.png "Current Status")

Current project status:
- Basic API returning database table schemas
- ERD generation using React Flow (XYFlow)

## Progress Update (20 Feb 2026)

### What’s Done

- ERD nodes render from live schema data (`/api/v1/schema`)
- Row-level handles added so relationships can connect to specific columns
- Constraint fetch wired from `/api/v1/constraints` (with graceful fallback if unavailable)
- Auto-layout added using Dagre for cleaner graph positioning
- Nodes are draggable with visual hover affordance
- Top bar includes API health status with 60-second polling
- Light/Dark mode toggle implemented with persistent theme setting
- React Flow controls and edge labels styled for theme consistency
- React Flow attribution watermark hidden

### Screenshots

- Current UI snapshot:

![SchemaLens UI - Current](images/current_status.png "SchemaLens Current UI")

## Future Features

- Snapshot of schemas so you can see how the schema has evolved over time
- Misconfigurations of your db schema.

## Run Entire App in Docker

All services run in containers (frontend + Python API), so you do not need local Node or Python setup.

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)

### Start

From the repository root:

```bash
docker compose -f schemalens/infra/docker-compose.yml up --build
```

### URLs

- Frontend: http://localhost:5173
- API base: http://localhost:8000/api/v1
- Schema: http://localhost:8000/api/v1/schema

### Stop

```bash
docker compose -f schemalens/infra/docker-compose.yml down
```
