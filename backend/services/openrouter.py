import json
import httpx
from typing import Dict, Any, Optional

class OpenRouterService:
    def __init__(self):
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    async def analyze_company(self, company_name: str, serper_data: Dict, scraped_data: Dict, api_key: str, model: str) -> Dict[str, Any]:
        """Send all data to OpenRouter and get a structured JSON response."""
        
        system_prompt = f"""You are an expert AI business analyst. 
Your task is to analyze the provided raw research data about a company and produce a highly structured JSON report.
Do NOT include any markdown formatting like ```json in the output. Just return the raw JSON object.

The JSON MUST strictly follow this schema:
{{
  "company_name": "...",
  "website": "...",
  "phone": "...",
  "address": "...",
  "products": ["...", "..."],
  "summary": "Detailed summary...",
  "pain_points": ["...", "..."],
  "competitors": ["...", "..."],
  "sources": ["...", "..."]
}}
"""
        
        user_prompt = f"""
Company to analyze: {company_name}

=== Serper Search Data ===
{json.dumps(serper_data, indent=2)}

=== Scraped Website Data ===
{json.dumps(scraped_data, indent=2)}

Analyze the data and return the structured JSON report. Ensure pain points and competitors are realistic based on the industry.
"""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "http://localhost:5173", # Standard required header for OpenRouter
            "X-Title": "Intellex",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.base_url, headers=headers, json=payload, timeout=60.0)
                response.raise_for_status()
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Try to parse the JSON
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    # Fallback cleanup just in case the model ignored the instructions
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0].strip()
                        return json.loads(content)
                    return {}
            except Exception as e:
                print(f"OpenRouter API Error: {e}")
                if isinstance(e, httpx.HTTPStatusError):
                    print(e.response.text)
                return {}

    async def chat(self, messages: list, api_key: str, model: str) -> str:
        """Handle chat interactions using OpenRouter."""
        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Intellex",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.base_url, headers=headers, json=payload, timeout=60.0)
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"OpenRouter Chat API Error: {e}")
                return "I encountered an error while trying to process your request."
