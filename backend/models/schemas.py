"""
Intellex — Pydantic Schemas
Data models for API requests, responses, and internal data transfer.
"""
from typing import Any, Optional
from pydantic import BaseModel, Field

class SearchRequest(BaseModel):
    """Input for starting a company analysis."""
    company_name: str = Field(default="", description="Company name to research")
    company_url: str = Field(default="", description="Company website URL")
    openrouter_api_key: str = Field(default="", description="OpenRouter API Key")
    model: str = Field(default="google/gemini-2.5-flash", description="AI Model")

class SearchResponse(BaseModel):
    """Response after completing an analysis."""
    session_id: str
    company_name: str
    report_data: dict
    pdf_url: str
    status: str = "completed"

class ChatRequest(BaseModel):
    """Input for the chat endpoint."""
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str = Field(..., description="Session ID to retrieve context")
    openrouter_api_key: str = Field(..., description="OpenRouter API Key")
    model: str = Field(default="google/gemini-2.5-flash", description="AI Model")

class ChatResponse(BaseModel):
    """Response from the chat endpoint."""
    answer: str
