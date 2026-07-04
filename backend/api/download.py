import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/download/{session_id}")
async def download_report(session_id: str):
    """Download the generated PDF report."""
    pdf_path = f"sessions/{session_id}/report.pdf"
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF report not found.")
        
    return FileResponse(
        path=pdf_path,
        filename=f"Intellex_Report_{session_id[:8]}.pdf",
        media_type="application/pdf"
    )
