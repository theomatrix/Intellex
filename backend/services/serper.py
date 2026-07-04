import httpx
import os
from typing import Dict, Any

from config import settings

class SerperService:
    def __init__(self):
        self.api_key = settings.SERPER_API_KEY
        self.base_url = "https://google.serper.dev/search"

    async def search(self, query: str) -> Dict[str, Any]:
        """Perform a Google search using Serper.dev."""
        if not self.api_key:
            print("Warning: SERPER_API_KEY is not set.")
            return {}

        headers = {
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }
        payload = {
            "q": query,
            "num": 5  # Top 5 results are usually enough
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.base_url, headers=headers, json=payload, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Serper API Error: {e}")
                return {}

    async def get_company_info(self, company_name: str) -> Dict[str, Any]:
        """Specific search for company website and basic info."""
        results = await self.search(f"{company_name} official website")
        
        official_website = None
        organic_results = results.get("organic", [])
        
        # Try to guess the official website from top result
        if organic_results:
            official_website = organic_results[0].get("link")
            
        # Also get general info
        knowledge_graph = results.get("knowledgeGraph", {})
        
        return {
            "official_website": official_website,
            "knowledge_graph": knowledge_graph,
            "top_results": organic_results[:3]
        }
        
    async def get_competitors(self, company_name: str) -> list:
        """Search for competitors."""
        results = await self.search(f"companies like {company_name} competitors")
        organic_results = results.get("organic", [])
        return organic_results[:3]
