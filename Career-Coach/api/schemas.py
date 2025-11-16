"""
#Pydantic models for API request/response validation
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, validator
from datetime import datetime
from enum import Enum

class JobMatchRequest(BaseModel):
    """Request model for job matching"""
    user_id: str = Field(..., description="Unique identifier for the user")
    job_title: str = Field(..., description="Job title or role")
    skills: List[str] = Field(default_factory=list, description="List of skills")
    experience_level: Optional[str] = Field(
        None,
        description="Experience level (e.g., 'entry', 'mid', 'senior')"
    )
    location: Optional[str] = Field(
        None,
        description="Preferred job location"
    )
    max_results: int = Field(
        10,
        ge=1,
        le=50,
        description="Maximum number of job matches to return"
    )

class JobMatchResponse(BaseModel):
    """Response model for job matching"""
    job_id: str = Field(..., description="Unique identifier for the job")
    title: str = Field(..., description="Job title")
    company: str = Field(..., description="Company name")
    location: str = Field(..., description="Job location")
    match_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Matching score between 0 and 1"
    )
    skills_match: List[str] = Field(
        default_factory=list,
        description="List of matching skills"
    )
    url: Optional[HttpUrl] = Field(
        None,
        description="URL to the job posting"
    )

class ChatMessage(BaseModel):
    """Chat message model"""
    role: str = Field(..., description="Role of the message sender (user/assistant)")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Message timestamp in UTC"
    )

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    user_id: str = Field(..., description="Unique identifier for the user")
    message: str = Field(..., description="User's message")
    conversation_id: Optional[str] = Field(
        None,
        description="Conversation ID for multi-turn conversations"
    )

class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="Assistant's response")
    conversation_id: str = Field(..., description="Conversation ID")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp in UTC"
    )
    suggestions: Optional[List[str]] = Field(
        None,
        description="List of suggested responses or actions"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata about the response"
    )

class AnalysisType(str, Enum):
    """Types of analysis available"""
    SKILLS_DEMAND = "skills_demand"
    SALARY_TRENDS = "salary_trends"
    JOB_MARKET = "job_market"
    INDUSTRY_TRENDS = "industry_trends"

class AnalysisRequest(BaseModel):
    """Request model for analysis endpoint"""
    analysis_type: AnalysisType = Field(..., description="Type of analysis to perform")
    location: Optional[str] = Field(
        None,
        description="Geographic location to filter analysis"
    )
    time_range: Optional[str] = Field(
        "1y",
        description="Time range for analysis (e.g., '1m', '3m', '6m', '1y')"
    )

class AnalysisResult(BaseModel):
    """Analysis result item"""
    label: str = Field(..., description="Category or label")
    value: float = Field(..., description="Numerical value or score")
    change: Optional[float] = Field(
        None,
        description="Percentage change from previous period"
    )

class AnalysisResponse(BaseModel):
    """Response model for analysis endpoint"""
    analysis_type: AnalysisType = Field(..., description="Type of analysis performed")
    results: List[AnalysisResult] = Field(
        default_factory=list,
        description="List of analysis results"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the analysis was performed"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata about the analysis"
    )

class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str = Field(..., description="Error message")
    code: int = Field(..., description="HTTP status code")
    details: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional error details"
    )
