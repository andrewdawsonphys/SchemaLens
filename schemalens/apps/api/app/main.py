from fastapi import FastAPI

app = FastAPI(title="SchemaLens API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1")
def root() -> dict[str, str]:
    return {"message": "SchemaLens API is running"}
