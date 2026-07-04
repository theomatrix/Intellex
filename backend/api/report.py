import json
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/report/{session_id}")
async def get_report(session_id: str):
    """Retrieve the generated report for a given session."""
    session_dir = f"sessions/{session_id}"
    raw_data_path = os.path.join(session_dir, "raw_data.json")
    
    if not os.path.exists(raw_data_path):
        raise HTTPException(status_code=404, detail="Report not found or session expired")
        
    try:
        with open(raw_data_path, "r") as f:
            data = json.load(f)
            report_data = data.get("report", {})
            return JSONResponse(content=report_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load report")
