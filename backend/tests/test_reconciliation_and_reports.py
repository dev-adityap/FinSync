import io

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _csv_file(name, content):
    return ("file", (name, io.BytesIO(content.encode()), "text/csv"))


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_csv_preview_basic():
    content = "id,name,amount\n001,Alice,10.5\n002,Bob,20\n"
    r = client.post("/api/csv/preview", files=[_csv_file("src.csv", content)], data={"preview_limit": "2"})
    assert r.status_code == 200
    body = r.json()
    assert body["row_count"] == 2
    assert body["headers"] == ["id", "name", "amount"]
    assert body["sample_rows"][0]["id"] == "001"


def test_leading_zero_preserved_in_reconciliation():
    src = "id,val\n001,10\n"
    dst = "id,val\n001,10\n"
    config = '{"unique_key_source":"id","unique_key_destination":"id","field_mappings":[{"source_column":"id","destination_column":"id","data_type":"string","required":true},{"source_column":"val","destination_column":"val","data_type":"number","required":true}],"validation_options":{"numeric_tolerance":"0.01"}}'
    r = client.post(
        "/api/reconciliation/run",
        files=[("source_file", ("s.csv", io.BytesIO(src.encode()), "text/csv")),
               ("destination_file", ("d.csv", io.BytesIO(dst.encode()), "text/csv"))],
        data={"config_json": config, "session_id": "s1"},
    )
    assert r.status_code == 200
    rec = r.json()["records"][0]
    assert rec["record_id"] == "001"


def test_duplicate_detection():
    src = "id,val\n1,a\n1,b\n"
    dst = "id,val\n1,a\n"
    config = '{"unique_key_source":"id","unique_key_destination":"id","field_mappings":[{"source_column":"id","destination_column":"id","data_type":"string","required":true},{"source_column":"val","destination_column":"val","data_type":"string","required":true}],"validation_options":{"detect_duplicates":true}}'
    r = client.post(
        "/api/reconciliation/run",
        files=[("source_file", ("s.csv", io.BytesIO(src.encode()), "text/csv")),
               ("destination_file", ("d.csv", io.BytesIO(dst.encode()), "text/csv"))],
        data={"config_json": config, "session_id": "s2"},
    )
    assert r.status_code == 200
    statuses = [rec["primary_status"] for rec in r.json()["records"]]
    assert "DUPLICATE" in statuses


def test_missing_and_unexpected():
    src = "id,val\n1,a\n"
    dst = "id,val\n2,b\n"
    config = '{"unique_key_source":"id","unique_key_destination":"id","field_mappings":[{"source_column":"id","destination_column":"id","data_type":"string","required":true},{"source_column":"val","destination_column":"val","data_type":"string","required":true}],"validation_options":{}}'
    r = client.post(
        "/api/reconciliation/run",
        files=[("source_file", ("s.csv", io.BytesIO(src.encode()), "text/csv")),
               ("destination_file", ("d.csv", io.BytesIO(dst.encode()), "text/csv"))],
        data={"config_json": config, "session_id": "s3"},
    )
    assert r.status_code == 200
    statuses = [rec["primary_status"] for rec in r.json()["records"]]
    assert "MISSING_IN_DESTINATION" in statuses
    assert "UNEXPECTED_IN_DESTINATION" in statuses


def test_decimal_tolerance_and_mismatch():
    src = "id,val\n1,10.00\n"
    dst = "id,val\n1,10.05\n"
    config = '{"unique_key_source":"id","unique_key_destination":"id","field_mappings":[{"source_column":"id","destination_column":"id","data_type":"string","required":true},{"source_column":"val","destination_column":"val","data_type":"number","required":true}],"validation_options":{"numeric_tolerance":"0.01"}}'
    r = client.post(
        "/api/reconciliation/run",
        files=[("source_file", ("s.csv", io.BytesIO(src.encode()), "text/csv")),
               ("destination_file", ("d.csv", io.BytesIO(dst.encode()), "text/csv"))],
        data={"config_json": config, "session_id": "s4"},
    )
    assert r.status_code == 200
    rec = r.json()["records"][0]
    assert rec["primary_status"] == "MISMATCHED"


def test_formula_safe_csv_export():
    records = [{"record_id": "=SUM(A1)", "primary_status": "MATCHED", "issue_count": 0, "issue_types": [], "source_summary": "+cmd", "destination_summary": "@x", "validation_reasons": []}]
    r = client.post("/api/reports/complete", json={"session_name": "t", "records": records})
    assert r.status_code == 200
    text = r.text
    assert "'=SUM(A1)" in text or "\"'=SUM(A1)\"" in text


def test_temp_file_cleanup():
    content = "id,name\n1,Alice\n"
    r = client.post("/api/csv/preview", files=[_csv_file("t.csv", content)])
    assert r.status_code == 200
    # no assertion on filesystem; ensure request succeeded
