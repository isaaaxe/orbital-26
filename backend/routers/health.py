from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

router=APIRouter(
    prefix="/health",
    tags=["health"]
)

@router.get("")
async def get_health():
    return {"status": "ok"}

# maybe can add health check for db next time, not sure how necessary


