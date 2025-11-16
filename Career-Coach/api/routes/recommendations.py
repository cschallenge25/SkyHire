from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory store for demo; swap with DB (Mongo) in prod
RESULT_STORE = {}

class Skill(BaseModel):
    name: str
    level: Optional[str] = None

class UserProfile(BaseModel):
    user_id: Optional[str] = Field(default=None, example="user_123")
    cv_text: str = Field(..., example="Experienced cabin crew with 3 years ...")
    skills: List[Skill] = []
    desired_roles: Optional[List[str]] = []
    top_n: Optional[int] = Field(default=10, ge=1, le=100)

class RecommendationResponse(BaseModel):
    recommendation_id: str
    created_at: datetime

class JobMatch(BaseModel):
    job_id: str
    title: str
    score: float
    metadata: dict

class RecommendationResult(BaseModel):
    status: str
    created_at: str
    user_id: Optional[str]
    matches: List[JobMatch]
    extracted_skills: List[str]
    error: Optional[str] = None

@router.post("/", response_model=RecommendationResponse, status_code=202)
def create_recommendations(payload: UserProfile, background_tasks: BackgroundTasks):
    """
    Accepts a user profile, asks the NLP service for embeddings and skills extraction,
    then scores jobs via the model. Work runs in background; result stored and retrievable via GET /results/{id}.
    (For synchronous behaviour change background tasks to direct call.)
    """
    rec_id = str(uuid.uuid4())
    logger.info("Received recommendation request for user_id=%s rec_id=%s", payload.user_id, rec_id)

    # create a minimal placeholder result so /results returns something immediately if wanted
    RESULT_STORE[rec_id] = {"status": "processing", "created_at": datetime.utcnow().isoformat()}

    # run processing in background
    background_tasks.add_task(_process_request, rec_id, payload.dict())

    return {"recommendation_id": rec_id, "created_at": datetime.utcnow()}

def _process_request(rec_id: str, payload: dict):
    try:
        # 1) Call NLP service to get user embedding + extracted skills
        # For demo, we'll simulate NLP processing
        extracted_skills = ["Customer Service", "Safety Procedures", "Communication"]
        user_embedding = [0.1, 0.2, 0.3]  # Mock embedding

        # 2) Load job embeddings and job metadata (for demo we assume MODEL_SVC provides job embeddings)
        jobs = [
            {"job_id": "job1", "title": "Cabin Crew Member", "embedding": [0.1, 0.2, 0.4], "metadata": {"company": "Air France"}},
            {"job_id": "job2", "title": "Flight Attendant", "embedding": [0.1, 0.2, 0.3], "metadata": {"company": "Lufthansa"}},
            {"job_id": "job3", "title": "Airline Customer Service", "embedding": [0.1, 0.3, 0.3], "metadata": {"company": "Emirates"}},
        ]

        # 3) Score each job
        matches = []
        for job in jobs:
            # Simple cosine similarity mock
            score = sum(a*b for a, b in zip(user_embedding, job["embedding"])) / (
                sum(a*a for a in user_embedding)**0.5 * sum(b*b for b in job["embedding"])**0.5
            )
            matches.append({
                "job_id": job["job_id"],
                "title": job["title"],
                "score": float(score),
                "metadata": job.get("metadata", {})
            })

        # 4) Sort and keep top_n
        top_n = payload.get("top_n", 10)
        matches = sorted(matches, key=lambda x: x["score"], reverse=True)[:top_n]

        RESULT_STORE[rec_id] = {
            "status": "done",
            "created_at": datetime.utcnow().isoformat(),
            "user_id": payload.get("user_id"),
            "matches": matches,
            "extracted_skills": extracted_skills
        }
        logger.info("Completed rec_id=%s matches=%d", rec_id, len(matches))
    except Exception as exc:
        logger.exception("Processing failed for rec_id=%s: %s", rec_id, exc)
        RESULT_STORE[rec_id] = {"status": "error", "error": str(exc)}

@router.get("/results/{rec_id}", response_model=RecommendationResult)
def get_recommendation_result(rec_id: str):
    """Retrieve the result of a recommendation request."""
    if rec_id not in RESULT_STORE:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    result = RESULT_STORE[rec_id]
    if result["status"] == "error":
        return RecommendationResult(
            status="error", 
            created_at=result.get("created_at", ""),
            user_id=None,
            matches=[],
            extracted_skills=[],
            error=result["error"]
        )
    return RecommendationResult(**result)
