from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.discord import DiscordService
import os

router = APIRouter()

class DiscordSendRequest(BaseModel):
    session_id: str
    applicant_name: str
    applicant_email: str
    discord_bot_token: str
    discord_channel_id: str
    company_name: str
    website: str

@router.post("/discord")
async def send_to_discord(req: DiscordSendRequest):
    discord = DiscordService()
    session_dir = f"sessions/{req.session_id}"
    pdf_path = os.path.join(session_dir, "report.pdf")
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF report not found for this session.")
        
    success = await discord.send_report(
        bot_token=req.discord_bot_token,
        channel_id=req.discord_channel_id,
        applicant_name=req.applicant_name,
        applicant_email=req.applicant_email,
        company_name=req.company_name,
        website=req.website,
        pdf_path=pdf_path
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send report to Discord.")
        
    return {"status": "success"}
