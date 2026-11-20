from fastapi import APIRouter

from app.api.v1 import csv_routes, health, mapping_routes, reconcile_routes, report_routes

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(csv_routes.router)
api_router.include_router(mapping_routes.router)
api_router.include_router(reconcile_routes.router)
api_router.include_router(report_routes.router)