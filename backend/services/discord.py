import httpx
import os
from typing import Optional

class DiscordService:
    async def send_report(self, bot_token: str, channel_id: str, applicant_name: str, applicant_email: str, company_name: str, website: str, pdf_path: str) -> bool:
        """Send the generated report to a Discord channel via bot token."""
        
        url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
        headers = {
            "Authorization": f"Bot {bot_token}"
        }
        
        content = f"**New Company Report Generated**\n**Applicant:** {applicant_name} ({applicant_email})\n**Company:** {company_name}\n**Website:** {website}"
        
        data = {
            "content": content
        }
        
        try:
            # Check if file exists
            if not os.path.exists(pdf_path):
                print(f"Error: PDF not found at {pdf_path}")
                return False
                
            async with httpx.AsyncClient() as client:
                with open(pdf_path, "rb") as f:
                    files = {
                        "file": (os.path.basename(pdf_path), f, "application/pdf")
                    }
                    response = await client.post(url, headers=headers, data=data, files=files, timeout=30.0)
                    response.raise_for_status()
                    return True
        except Exception as e:
            print(f"Discord API Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(e.response.text)
            return False
