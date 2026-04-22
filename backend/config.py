"""
Configuration module — loads environment variables and validates required settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    NCBI_EMAIL: str = os.getenv("NCBI_EMAIL", "")
    NCBI_API_KEY: str = os.getenv("NCBI_API_KEY", "")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
    ).split(",")

    def validate(self) -> None:
        """Validate that required settings are provided."""
        if not self.NCBI_EMAIL or self.NCBI_EMAIL == "your_email@example.com":
            print(
                "⚠️  WARNING: NCBI_EMAIL belum dikonfigurasi di .env — "
                "menggunakan default. Silakan update untuk production use."
            )


settings = Settings()
settings.validate()
