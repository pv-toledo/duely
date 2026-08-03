import json
from decimal import Decimal
from pathlib import Path

import pytest
from pydantic import TypeAdapter

from services.extraction.schemas import BillsFields, HealthFields, UnclearFields, VehicleFields

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "responses"

_extraction_fields_adapter = TypeAdapter(VehicleFields | HealthFields | BillsFields | UnclearFields)


def _load(filename: str) -> dict:
    with open(FIXTURES_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


@pytest.mark.parametrize(
    "filename,expected_class",
    [
        ("vehicle.json", VehicleFields),
        ("health.json", HealthFields),
        ("bills.json", BillsFields),
        ("unclear.json", UnclearFields),
    ],
)
def test_extraction_routes_to_correct_category(filename, expected_class):
    data = _load(filename)
    result = _extraction_fields_adapter.validate_python(data)
    assert isinstance(result, expected_class)


def test_vehicle_extraction_fields():
    result = _extraction_fields_adapter.validate_python(_load("vehicle.json"))
    assert result.document_type == "drivers_license"
    assert result.subject_name == "Lorenzo Avelar Dornes"
    assert result.plate is None  # not visible on a driver's license


def test_health_extraction_omits_due_date():
    result = _extraction_fields_adapter.validate_python(_load("health.json"))
    assert result.document_type == "exam_result"
    assert result.due_date is None  # exam results don't carry a deadline


def test_bills_extraction_preserves_decimal_precision():
    result = _extraction_fields_adapter.validate_python(_load("bills.json"))
    assert result.amount == Decimal("187.42")
    assert result.reference_period == "07/2026"


def test_unclear_extraction_has_no_category_fields():
    result = _extraction_fields_adapter.validate_python(_load("unclear.json"))
    assert result.subject_name is None
    assert result.reason is not None
