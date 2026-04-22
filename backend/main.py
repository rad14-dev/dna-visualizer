"""
DNA Visualizer Backend — FastAPI entry point.

Serves the REST API for DNA sequence fetching, transcription, and translation.
Run with: uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes.sequence import router as sequence_router

app = FastAPI(
    title="DNA Visualizer API",
    description="DNA to Protein visualization backend — fetch, transcribe, translate.",
    version="1.0.1",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ────────────────────────────────────────────────────────
app.include_router(sequence_router)


@app.get("/")
async def root():
    """Root endpoint — redirect info to docs."""
    return {
        "app": "DNA Visualizer API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=settings.BACKEND_PORT, reload=True)
