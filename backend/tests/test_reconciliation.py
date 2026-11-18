import pytest
import io
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    """Test the health endpoint returns healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert "timestamp" in data


def test_version_endpoint():
    """Test the version endpoint."""
    response = client.get("/api/version")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == "1.0.0"


def test_csv_preview_valid():
    """Test CSV preview with a valid file."""
    csv_content = b"ID,Name,Amount\n101,Rahul,5000\n102,Amit,2500\n"
    response = client.post(
        "/api/csv/preview",
        files={"file": ("test.csv", io.BytesIO(csv_content), "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["headers"] == ["ID", "Name", "Amount"]
    assert data["rowCount"] == 2
    assert len(data["preview"]) == 2
    assert data["encoding"] == "utf-8"


def test_csv_preview_empty():
    """Test CSV preview with an empty file."""
    csv_content = b"ID,Name,Amount\n"
    response = client.post(
        "/api/csv/preview",
        files={"file": ("test.csv", io.BytesIO(csv_content), "text/csv")}
    )
    assert response.status_code == 400


def test_csv_preview_invalid_format():
    """Test CSV preview with a non-CSV file."""
    response = client.post(
        "/api/csv/preview",
        files={"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")}
    )
    assert response.status_code == 400


def test_csv_validate_valid():
    """Test CSV validation with a valid file."""
    csv_content = b"ID,Name,Amount\n101,Rahul,5000\n102,Amit,2500\n"
    response = client.post(
        "/api/csv/validate",
        files={"file": ("test.csv", io.BytesIO(csv_content), "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True


def test_csv_validate_empty():
    """Test CSV validation with an empty file."""
    csv_content = b"ID,Name,Amount\n"
    response = client.post(
        "/api/csv/validate",
        files={"file": ("test.csv", io.BytesIO(csv_content), "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False


def test_mapping_preview():
    """Test column mapping preview endpoint."""
    source_csv = b"ID,Name,Email,Amount\n101,Rahul,rahul@test.com,5000\n"
    dest_csv = b"customer_id,customer_name,email,amount\n101,Rahul,rahul@test.com,5000\n"
    response = client.post(
        "/api/mapping/preview",
        files={
            "sourceFile": ("source.csv", io.BytesIO(source_csv), "text/csv"),
            "destinationFile": ("dest.csv", io.BytesIO(dest_csv), "text/csv"),
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "ID" in data["sourceColumns"]
    assert "customer_id" in data["destinationColumns"]


def test_validate_config_valid():
    """Test configuration validation with valid config."""
    config = {
        "columnMappings": [
            {"sourceColumn": "ID", "destinationColumn": "customer_id", "dataType": "string", "isUniqueIdentifier": True, "isRequired": True},
            {"sourceColumn": "Amount", "destinationColumn": "amount", "dataType": "number", "isUniqueIdentifier": False, "isRequired": False},
        ],
        "uniqueIdentifier": "ID",
        "validation": {
            "caseInsensitive": True,
            "trimWhitespace": True,
            "normalizeNumbers": True,
            "numericTolerance": 0.01,
            "detectMissing": True,
            "detectUnexpected": True,
            "detectDuplicates": True,
            "requiredFields": [],
            "emptyValues": ["", "null"],
            "validateEmails": False,
        }
    }
    response = client.post("/api/reconciliation/validate-config", json=config)
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True


def test_validate_config_invalid():
    """Test configuration validation with invalid config (missing unique identifier)."""
    config = {
        "columnMappings": [],
        "uniqueIdentifier": "",
        "validation": {
            "caseInsensitive": True,
            "trimWhitespace": True,
            "normalizeNumbers": True,
            "numericTolerance": 0.01,
            "detectMissing": True,
            "detectUnexpected": True,
            "detectDuplicates": True,
            "requiredFields": [],
            "emptyValues": ["", "null"],
            "validateEmails": False,
        }
    }
    response = client.post("/api/reconciliation/validate-config", json=config)
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False


def test_reconciliation_run_sample():
    """Test full reconciliation run with sample data."""
    source_csv = b"""ID,Name,Email,Amount,Status
101,Rahul Sharma,rahul@example.com,5000,Active
102,Amit Das,amit@example.com,2500,Active
103,Priya Sen,priya@example.com,8000,Active
104,Ankit Roy,ankit@example.com,3200,Active
105,Neha Das,neha@example.com,4500,Inactive
"""
    dest_csv = b"""customer_id,customer_name,email,amount,status
101,Rahul Sharma,rahul@example.com,5000,Active
102,Amit Das,amit@example.com,2500,Active
103,Priya Sen,priya@example.com,800,Active
105,Neha Das,neha@example.com,4500,Inactive
106,Sourav Pal,sourav@example.com,6000,Active
"""

    config = {
        "columnMappings": [
            {"sourceColumn": "ID", "destinationColumn": "customer_id", "dataType": "string", "isUniqueIdentifier": True, "isRequired": True},
            {"sourceColumn": "Name", "destinationColumn": "customer_name", "dataType": "string", "isUniqueIdentifier": False, "isRequired": False},
            {"sourceColumn": "Email", "destinationColumn": "email", "dataType": "email", "isUniqueIdentifier": False, "isRequired": False},
            {"sourceColumn": "Amount", "destinationColumn": "amount", "dataType": "number", "isUniqueIdentifier": False, "isRequired": False},
            {"sourceColumn": "Status", "destinationColumn": "status", "dataType": "string", "isUniqueIdentifier": False, "isRequired": False},
        ],
        "uniqueIdentifier": "ID",
        "validation": {
            "caseInsensitive": True,
            "trimWhitespace": True,
            "normalizeNumbers": True,
            "normalizeDates": False,
            "numericTolerance": 0.01,
            "detectMissing": True,
            "detectUnexpected": True,
            "detectDuplicates": True,
            "requiredFields": [],
            "emptyValues": ["", "null"],
            "validateEmails": False,
        }
    }

    response = client.post(
        "/api/reconciliation/run",
        files={
            "sourceFile": ("source.csv", io.BytesIO(source_csv), "text/csv"),
            "destinationFile": ("dest.csv", io.BytesIO(dest_csv), "text/csv"),
        },
        data={"config": json.dumps(config)}
    )
    assert response.status_code == 200
    data = response.json()
    assert "sessionId" in data
    assert "results" in data
    results = data["results"]
    assert results["metrics"]["sourceRows"] == 5
    assert results["metrics"]["destinationRows"] == 5
    assert results["metrics"]["matched"] == 3  # 101, 102, 105 match
    assert results["metrics"]["mismatched"] == 1  # 103 has amount mismatch
    assert results["metrics"]["missing"] == 1  # 104 missing in destination
    assert results["metrics"]["unexpected"] == 1  # 106 unexpected in destination
    assert results["metrics"]["matchPercentage"] == 60.0  # 3/5 * 100


def test_reconciliation_run_duplicates():
    """Test reconciliation with duplicate identifiers."""
    source_csv = b"""ID,Name,Amount
101,Rahul,5000
101,Rahul,5000
102,Amit,2500
"""
    dest_csv = b"""customer_id,customer_name,amount
101,Rahul,5000
102,Amit,2500
"""

    config = {
        "columnMappings": [
            {"sourceColumn": "ID", "destinationColumn": "customer_id", "dataType": "string", "isUniqueIdentifier": True, "isRequired": True},
            {"sourceColumn": "Name", "destinationColumn": "customer_name", "dataType": "string", "isUniqueIdentifier": False, "isRequired": False},
            {"sourceColumn": "Amount", "destinationColumn": "amount", "dataType": "number", "isUniqueIdentifier": False, "isRequired": False},
        ],
        "uniqueIdentifier": "ID",
        "validation": {
            "caseInsensitive": True,
            "trimWhitespace": True,
            "normalizeNumbers": True,
            "numericTolerance": 0.01,
            "detectMissing": True,
            "detectUnexpected": True,
            "detectDuplicates": True,
            "requiredFields": [],
            "emptyValues": ["", "null"],
            "validateEmails": False,
        }
    }

    response = client.post(
        "/api/reconciliation/run",
        files={
            "sourceFile": ("source.csv", io.BytesIO(source_csv), "text/csv"),
            "destinationFile": ("dest.csv", io.BytesIO(dest_csv), "text/csv"),
        },
        data={"config": json.dumps(config)}
    )
    assert response.status_code == 200
    data = response.json()
    results = data["results"]
    assert results["metrics"]["duplicate"] >= 1


def test_reconciliation_run_empty_source():
    """Test reconciliation with empty source CSV."""
    source_csv = b"ID,Name,Amount\n"
    dest_csv = b"customer_id,customer_name,amount\n101,Rahul,5000\n"

    config = {
        "columnMappings": [
            {"sourceColumn": "ID", "destinationColumn": "customer_id", "dataType": "string", "isUniqueIdentifier": True, "isRequired": True},
        ],
        "uniqueIdentifier": "ID",
        "validation": {
            "caseInsensitive": True,
            "trimWhitespace": True,
            "normalizeNumbers": True,
            "numericTolerance": 0.01,
            "detectMissing": True,
            "detectUnexpected": True,
            "detectDuplicates": True,
            "requiredFields": [],
            "emptyValues": ["", "null"],
            "validateEmails": False,
        }
    }

    response = client.post(
        "/api/reconciliation/run",
        files={
            "sourceFile": ("source.csv", io.BytesIO(source_csv), "text/csv"),
            "destinationFile": ("dest.csv", io.BytesIO(dest_csv), "text/csv"),
        },
        data={"config": json.dumps(config)}
    )
    assert response.status_code == 400


def test_report_generation():
    """Test report generation endpoint."""
    response = client.post(
        "/api/reports/summary",
        params={"session_id": "test-session-id"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_report_invalid_type():
    """Test report generation with invalid type."""
    response = client.post(
        "/api/reports/invalid-type",
        params={"session_id": "test-session-id"}
    )
    assert response.status_code == 400