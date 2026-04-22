import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Tambahkan direktori backend ke path agar Vercel bisa menemukan modul internal
sys.path.append(os.path.dirname(__file__))

# Import modul internal setelah path diatur
try:
    from config import settings
    from routes.sequence import router as sequence_router
except ImportError:
    # Fallback untuk struktur folder Vercel yang berbeda
    from .config import settings
    from .routes.sequence import router as sequence_router

app = FastAPI(
    title="DNA Visualizer API",
    description="DNA to Protein visualization backend — fetch, transcribe, translate.",
    version="1.0.1",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
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
