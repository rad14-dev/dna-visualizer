from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import sequence

app = FastAPI(title="DNA Visualizer API")

# Konfigurasi CORS agar Frontend (React) bisa mengambil data dari Backend ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], # Sesuaikan dengan port lokal React/Vite Anda
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan router dari file sequence.py
app.include_router(sequence.router)

@app.get("/")
def read_root():
    return {"status": "Backend FastAPI berjalan sukses!", "project": "DNA Visualizer"}