# SchemaLens

![Schema Lens Banner](images/schemalens-banner.svg "Schema Lens Banner")


SchemaLens is a lightweight toolkit for exploring, visualizing, and understanding data schemas.

## Run Entire App in Docker

All services run in containers (frontend + Python API), so you do not need local Node or Python setup.

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)

### Start

From the repository root:

```bash
docker compose -f schemalens/infra/docker-compose.yml up --build
```

### Stop

```bash
docker compose -f schemalens/infra/docker-compose.yml down
```
