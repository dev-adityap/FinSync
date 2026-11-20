from fastapi import APIRouter
from fastapi.responses import Response

from app.schemas.reports import ReportExportPayload
from app.services.report_generator import generate_filtered_report_csv

router = APIRouter(prefix="/reports", tags=["Reports"])


def _csv_response(csv_body: str, filename: str) -> Response:
    return Response(
        content=csv_body,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.post("/complete")
async def report_complete(payload: ReportExportPayload) -> Response:
    records = [r.model_dump() for r in payload.records]
    csv_body = generate_filtered_report_csv(records, allowed_statuses=None)
    return _csv_response(csv_body, "finsync-complete-report.csv")


@router.post("/mismatches")
async def report_mismatches(payload: ReportExportPayload) -> Response:
    records = [r.model_dump() for r in payload.records]
    csv_body = generate_filtered_report_csv(records, allowed_statuses={"MISMATCHED"})
    return _csv_response(csv_body, "finsync-mismatches-report.csv")


@router.post("/missing")
async def report_missing(payload: ReportExportPayload) -> Response:
    records = [r.model_dump() for r in payload.records]
    csv_body = generate_filtered_report_csv(
        records, allowed_statuses={"MISSING_IN_DESTINATION"}
    )
    return _csv_response(csv_body, "finsync-missing-report.csv")


@router.post("/duplicates")
async def report_duplicates(payload: ReportExportPayload) -> Response:
    records = [r.model_dump() for r in payload.records]
    csv_body = generate_filtered_report_csv(records, allowed_statuses={"DUPLICATE"})
    return _csv_response(csv_body, "finsync-duplicates-report.csv")


@router.post("/invalid")
async def report_invalid(payload: ReportExportPayload) -> Response:
    records = [r.model_dump() for r in payload.records]
    csv_body = generate_filtered_report_csv(records, allowed_statuses={"INVALID"})
    return _csv_response(csv_body, "finsync-invalid-report.csv")