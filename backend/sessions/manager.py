"""
Intellex — Session Manager
Handles creation, retrieval, TTL cleanup, and storage of session data.
"""
import json
import shutil
import time
import uuid
from pathlib import Path
from typing import Optional

from config import settings


class SessionManager:
    """Manages session lifecycle: create, read, update, cleanup."""

    def __init__(self):
        self._sessions_dir = Path(settings.SESSIONS_DIR)
        self._sessions_dir.mkdir(parents=True, exist_ok=True)
        self._session_meta: dict[str, dict] = {}  # In-memory index

    def create_session(self, company_name: str, company_url: str) -> str:
        """Create a new session directory and return its ID."""
        session_id = uuid.uuid4().hex[:8]
        session_path = self._sessions_dir / session_id

        # Create directory structure
        session_path.mkdir(parents=True, exist_ok=True)
        (session_path / "raw").mkdir(exist_ok=True)
        (session_path / "chunks").mkdir(exist_ok=True)
        (session_path / "embeddings").mkdir(exist_ok=True)

        # Initialize metadata
        meta = {
            "session_id": session_id,
            "company_name": company_name,
            "company_url": company_url,
            "status": "created",
            "created_at": time.time(),
            "agents_status": {},
            "completed_agents": [],
            "failed_agents": [],
        }
        self._save_meta(session_id, meta)
        self._session_meta[session_id] = meta

        return session_id

    def get_session(self, session_id: str) -> Optional[dict]:
        """Get session metadata. Returns None if not found or expired."""
        if session_id in self._session_meta:
            meta = self._session_meta[session_id]
            if self._is_expired(meta):
                self.delete_session(session_id)
                return None
            return meta

        # Try loading from disk
        meta_path = self._sessions_dir / session_id / "session_meta.json"
        if meta_path.exists():
            with open(meta_path) as f:
                meta = json.load(f)
            if self._is_expired(meta):
                self.delete_session(session_id)
                return None
            self._session_meta[session_id] = meta
            return meta

        return None

    def update_session(self, session_id: str, updates: dict):
        """Update session metadata fields."""
        meta = self.get_session(session_id)
        if meta is None:
            return
        meta.update(updates)
        self._save_meta(session_id, meta)
        self._session_meta[session_id] = meta

    def update_agent_status(
        self, session_id: str, agent_name: str, status: str, message: str = ""
    ):
        """Update the status of a specific agent within a session."""
        meta = self.get_session(session_id)
        if meta is None:
            return

        meta["agents_status"][agent_name] = {
            "status": status,
            "message": message,
            "updated_at": time.time(),
        }

        if status == "completed" and agent_name not in meta["completed_agents"]:
            meta["completed_agents"].append(agent_name)
        elif status == "failed" and agent_name not in meta["failed_agents"]:
            meta["failed_agents"].append(agent_name)

        self._save_meta(session_id, meta)
        self._session_meta[session_id] = meta

    def save_agent_output(self, session_id: str, agent_name: str, data: dict):
        """Save an agent's output data to the session directory."""
        session_path = self._sessions_dir / session_id
        if not session_path.exists():
            return
        output_path = session_path / f"{agent_name}.json"
        with open(output_path, "w") as f:
            json.dump(data, f, indent=2, default=str)

    def get_agent_output(self, session_id: str, agent_name: str) -> Optional[dict]:
        """Load an agent's output data from the session directory."""
        output_path = self._sessions_dir / session_id / f"{agent_name}.json"
        if output_path.exists():
            with open(output_path) as f:
                return json.load(f)
        return None

    def get_all_agent_outputs(self, session_id: str) -> dict[str, dict]:
        """Load all agent outputs for a session."""
        session_path = self._sessions_dir / session_id
        outputs = {}
        if session_path.exists():
            for json_file in session_path.glob("*.json"):
                if json_file.name == "session_meta.json":
                    continue
                agent_name = json_file.stem
                with open(json_file) as f:
                    outputs[agent_name] = json.load(f)
        return outputs

    def get_session_path(self, session_id: str) -> Path:
        """Get the filesystem path for a session."""
        return self._sessions_dir / session_id

    def delete_session(self, session_id: str):
        """Delete a session and all its data."""
        session_path = self._sessions_dir / session_id
        if session_path.exists():
            shutil.rmtree(session_path, ignore_errors=True)
        self._session_meta.pop(session_id, None)

    def cleanup_expired(self) -> int:
        """Remove all expired sessions. Returns count of cleaned sessions."""
        cleaned = 0
        if not self._sessions_dir.exists():
            return cleaned

        for session_dir in self._sessions_dir.iterdir():
            if not session_dir.is_dir():
                continue
            meta_path = session_dir / "session_meta.json"
            if meta_path.exists():
                try:
                    with open(meta_path) as f:
                        meta = json.load(f)
                    if self._is_expired(meta):
                        self.delete_session(meta["session_id"])
                        cleaned += 1
                except (json.JSONDecodeError, KeyError):
                    # Corrupted meta, delete it
                    shutil.rmtree(session_dir, ignore_errors=True)
                    cleaned += 1
            else:
                # No metadata, orphaned directory
                shutil.rmtree(session_dir, ignore_errors=True)
                cleaned += 1

        return cleaned

    def _is_expired(self, meta: dict) -> bool:
        """Check if a session has exceeded its TTL."""
        created_at = meta.get("created_at", 0)
        return (time.time() - created_at) > settings.SESSION_TTL

    def _save_meta(self, session_id: str, meta: dict):
        """Persist session metadata to disk."""
        meta_path = self._sessions_dir / session_id / "session_meta.json"
        meta_path.parent.mkdir(parents=True, exist_ok=True)
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2, default=str)


# Singleton instance
session_manager = SessionManager()
