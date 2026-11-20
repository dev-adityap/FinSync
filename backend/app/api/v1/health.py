from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.APP_NAME,
    }


@router.get("/version")
async def version_info() -> dict[str, str]:
    return {
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "mode": "anonymous-local-first",
    }