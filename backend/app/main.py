import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import FinSyncError


class InMemoryRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        bucket = self._hits[key]
        while bucket and (now - bucket[0]) > self.window_seconds:
            bucket.popleft()
        if len(bucket) >= self.max_requests:
            return False
        bucket.append(now)
        return True


rate_limiter = InMemoryRateLimiter(max_requests=settings.REQUEST_RATE_LIMIT_PER_MINUTE)

is_prod = settings.ENVIRONMENT.lower() == "production"

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url=None if is_prod else "/docs",
    redoc_url=None if is_prod else "/redoc",
    openapi_url=None if is_prod else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/api") and not request.url.path.endswith("/health"):
        client_host = request.client.host if request.client else "anonymous"
        if not rate_limiter.allow(client_host):
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "detail": "Too many requests. Please slow down and try again shortly.",
                },
            )

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.exception_handler(FinSyncError)
async def finsync_error_handler(_: Request, exc: FinSyncError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "validation_error" if exc.status_code < 500 else "server_error",
            "detail": exc.message,
        },
    )


@app.exception_handler(RequestValidationError)
async def request_validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    first_err = exc.errors()[0] if exc.errors() else {}
    msg = first_err.get("msg", "Invalid request parameters.")
    loc = " -> ".join(str(part) for part in first_err.get("loc", []))
    detail = f"{loc}: {msg}" if loc else msg
    return JSONResponse(
        status_code=422,
        content={
            "error": "request_validation_error",
            "detail": detail,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "detail": "An unexpected error occurred while processing your request.",
        },
    )


app.include_router(api_router)