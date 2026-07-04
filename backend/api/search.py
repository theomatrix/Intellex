import json
import os
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.models.schemas import SearchRequest, SearchResponse
from backend.crawler.scraper import Scraper
from backend.services.serper import SerperService
from backend.services.openrouter import OpenRouterService
from backend.services.discord import DiscordService
from backend.services.pdf import PDFService

router = APIRouter()

@router.post("/search", response_model=SearchResponse)
async def create_search(req: SearchRequest):
    """
    Main endpoint that runs the entire simplified pipeline synchronously.
    (In a real production app, this would be a background task, but for this assignment 
    it's sufficient to run it inline and return the result).
    """
    if not req.company_name and not req.company_url:
        raise HTTPException(status_code=400, detail="Must provide company_name or company_url")

    search_query = req.company_name if req.company_name else req.company_url
    
    # 1. Init Services
    serper = SerperService()
    scraper = Scraper()
    openrouter = OpenRouterService()
    discord = DiscordService()
    pdf_service = PDFService()
    
    session_id = str(uuid.uuid4())
    session_dir = f"sessions/{session_id}"
    os.makedirs(session_dir, exist_ok=True)
    
    try:
        # 2. Serper Search
        print(f"[{session_id}] Searching Serper for {search_query}...")
        serper_info = await serper.get_company_info(search_query)
        website = serper_info.get("official_website") or req.company_url
        
        if not website:
             raise HTTPException(status_code=400, detail="Could not determine official website.")
             
        competitors = await serper.get_competitors(search_query)
        
        serper_data = {
            "info": serper_info,
            "competitors": competitors
        }

        # 3. Crawl Website
        print(f"[{session_id}] Crawling {website}...")
        scraped_data = await scraper.crawl(website)
        await scraper.close()

        # 4. OpenRouter AI Analysis
        print(f"[{session_id}] Generating AI Report...")
        report_data = await openrouter.analyze_company(
            company_name=search_query,
            serper_data=serper_data,
            scraped_data=scraped_data,
            api_key=req.openrouter_api_key,
            model=req.model
        )
        
        if not report_data:
            raise HTTPException(status_code=500, detail="Failed to generate AI report.")

        # Save raw data
        with open(os.path.join(session_dir, "raw_data.json"), "w") as f:
            json.dump({
                "serper": serper_data,
                "scraped": scraped_data,
                "report": report_data
            }, f, indent=2)

        # 5. Generate PDF
        print(f"[{session_id}] Generating PDF...")
        pdf_path = os.path.join(session_dir, "report.pdf")
        pdf_service.generate_report(report_data, pdf_path)
        
        print(f"[{session_id}] Pipeline Complete.")
        
        return SearchResponse(
            session_id=session_id,
            company_name=report_data.get("company_name", search_query),
            report_data=report_data,
            pdf_url=f"/api/download/{session_id}"
        )

    except Exception as e:
        print(f"[{session_id}] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
