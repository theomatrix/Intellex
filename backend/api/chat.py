import json
import os
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.openrouter import OpenRouterService

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    """Simple chat endpoint using OpenRouter with research context."""
    session_dir = f"sessions/{req.session_id}"
    raw_data_path = os.path.join(session_dir, "raw_data.json")
    
    context_str = ""
    if os.path.exists(raw_data_path):
        with open(raw_data_path, "r") as f:
            data = json.load(f)
            # Use only the report and some serper data to avoid context overflow
            context_str = json.dumps({
                "company_report": data.get("report", {}),
                "serper_info": data.get("serper", {}).get("info", {})
            })
            
    system_prompt = "You are a helpful AI assistant representing the Intellex Intelligence Platform. You have access to the following research data about a company. Answer the user's questions based ONLY on this data. If the data does not contain the answer, say you don't know.\n\n"
    if context_str:
        system_prompt += f"Research Data:\n{context_str}"
        
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": req.message}
    ]
    
    openrouter = OpenRouterService()
    answer = await openrouter.chat(messages, req.openrouter_api_key, req.model)
    
    return ChatResponse(answer=answer)
