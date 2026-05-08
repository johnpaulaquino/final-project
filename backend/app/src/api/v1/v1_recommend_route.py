# FILE LOCATION: backend/app/src/api/v1/v1_recommend_route.py

from fastapi import APIRouter
from pydantic import BaseModel
from app.src.application.services.recommender_service import RecommenderService

v1_recommend_router = APIRouter(prefix="/api/v1", tags=["Recommendations"])

class RecommendRequest(BaseModel):
    query: str
    source: str = "chat"   # "chat" or "search"
    top_n: int = 4

@v1_recommend_router.post("/recommend")
async def get_recommendations(body: RecommendRequest):
    results = RecommenderService.recommend(
        query=body.query,
        top_n=body.top_n,
    )
    return {
        "source": body.source,
        "query": body.query,
        "recommendations": results,
    }