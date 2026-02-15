import os
import psycopg
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SchemaLens API", version="0.1.0")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    dsn = (
        f"postgresql://{os.getenv('POSTGRES_USER', 'postgres')}"
        f":{os.getenv('POSTGRES_PASSWORD', 'postgres')}"
        f"@{os.getenv('POSTGRES_HOST', 'postgres')}"
        f":{os.getenv('POSTGRES_PORT', '5432')}"
        f"/{os.getenv('POSTGRES_DB', 'schemalens')}"
    )
    return psycopg.connect(conninfo=dsn)

def get_db_schema():
    # we need to query the information_schema to get list of tables and columns
    stmt = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    with get_db_connection() as connection:
        with connection.cursor() as cur:
                cur.execute(stmt)
                tables = cur.fetchall()
    return [row[0] for row in tables]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1")
def root() -> dict[str, str]:
    return {"message": "SchemaLens API is running"}

@app.get("/api/v1/schema")
def schema() -> dict[str, list[str]] | dict[str, str]:

    try:
        tables = get_db_schema()
    except psycopg.Error as e:
        return {"error": str(e)}
    return {"tables": tables}
