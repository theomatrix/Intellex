"""
Intellex — Centralized Configuration via Environment Variables
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    # ── Serper.dev API ──────────────────────────────
    SERPER_API_KEY: str = ""

    # ── Nvidia API ──────────────────────────────────
    NVIDIA_API_KEY: str = ""

    # ── Session Management ───────────────────────────
    SESSION_TTL: int = 1800  # 30 minutes in seconds

    # ── Scraping Config ─────────────────────────────────
    SCRAPE_TIMEOUT: int = 15  # seconds per request
    MAX_PAGES_PER_SITE: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
