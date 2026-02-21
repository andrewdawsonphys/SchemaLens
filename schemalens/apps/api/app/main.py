import psycopg
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .crud import get_db_schema, get_db_constraints

app = FastAPI(title="SchemaLens API", version="0.1.0")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1")
def root() -> dict[str, str]:
    """
    Root endpoint to verify that the API is running.
    """
    return {"status": "SchemaLens API is running"}


@app.get("/api/v1/schema")
def get_schema():
    """
    Endpoint to retrieve the database schema information, including tables, columns, 
    data types, and constraints.
    """
    try:
        schema = get_db_schema()
    except psycopg.Error as e:
        return {"error": str(e)}
    return schema


@app.get("/api/v1/constraints")
def get_constraints():
    """
    Endpoint to retrieve the database constraints information, including tables,
    columns, data types, and constraints.
    """

    try:
        constraints = get_db_constraints()
    except psycopg.Error as e:
        return {"error": str(e)}
    return constraints
