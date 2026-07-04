"""
Intellex — AI-Powered Company Intelligence Platform
FastAPI Application Entry Point
"""
import asyncio
import os
import shutil
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from api.search import router as search_router
from api.chat import router as chat_router
from api.download import router as download_router
from api.discord import router as discord_router
from api.report import router as report_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup & shutdown events."""
    os.makedirs("sessions", exist_ok=True)
    cleanup_task = asyncio.create_task(_session_cleanup_loop())
    print(f"🚀 Intellex API started")
    yield
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    print("🛑 Intellex API shutting down")


async def _session_cleanup_loop():
    """Periodically clean up expired sessions (older than 30 mins)."""
    while True:
        await asyncio.sleep(60 * 5)  # Check every 5 minutes
        now = time.time()
        cleaned = 0
        
        if os.path.exists("sessions"):
            for session_id in os.listdir("sessions"):
                session_dir = os.path.join("sessions", session_id)
                if os.path.isdir(session_dir):
                    mtime = os.path.getmtime(session_dir)
                    # Delete if older than 30 minutes
                    if now - mtime > 1800:
                        shutil.rmtree(session_dir)
                        cleaned += 1
                        
        if cleaned:
            print(f"🧹 Cleaned {cleaned} expired session(s)")


app = FastAPI(
    title="Intellex API",
    description="AI-Powered Company Intelligence Platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(search_router, prefix="/api", tags=["search"])
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(download_router, prefix="/api", tags=["download"])
app.include_router(discord_router, prefix="/api", tags=["discord"])
app.include_router(report_router, prefix="/api", tags=["report"])

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "intellex",
        "version": "0.1.0",
    }
