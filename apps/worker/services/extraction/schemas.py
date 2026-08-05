from datetime import date
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, BeforeValidator, Field


def _coerce_decimal_from_float(value: object) -> object:
    if isinstance(value, float):
        return str(value)
    return value


MoneyAmount = Annotated[Decimal, BeforeValidator(_coerce_decimal_from_float)]


class ExtractionFieldsBase(BaseModel):
    subject_name: str | None = None
    issuer_name: str | None = None
    due_date: date | None = None
    language: Literal["pt", "en"] | None = Field(
        default=None,
        description=(
            "Primary language the document is written in. "
            "Null if genuinely illegible or mixed with no clear majority."
        ),
    )


class VehicleFields(ExtractionFieldsBase):
    """Vehicle document: driver's license, vehicle registration, or insurance policy."""

    category: Literal["vehicle"]
    document_type: Literal["drivers_license", "vehicle_registration", "insurance"] | None = Field(
        default=None,
        description=(
            "drivers_license = CNH; vehicle_registration = CRLV/CRV; "
            "insurance = apólice de seguro veicular"
        ),
    )
    document_number: str | None = None
    plate: str | None = None
    amount: MoneyAmount | None = None


class HealthFields(ExtractionFieldsBase):
    """Health document: exam result, prescription, or vaccination record."""

    category: Literal["health"]
    document_type: Literal["exam_result", "prescription", "vaccination_record"] | None = Field(
        default=None,
        description=(
            "exam_result = resultado de exame; prescription = receita médica; "
            "vaccination_record = carteira/comprovante de vacinação"
        ),
    )
    document_date: date | None = None
    description: str | None = None


class BillsFields(ExtractionFieldsBase):
    """Recurring bill or invoice: utilities, condo fee, internet, or credit card."""

    category: Literal["bills"]
    document_type: (
        Literal[
            "utility_water",
            "utility_electricity",
            "utility_gas",
            "condo_fee",
            "internet",
            "credit_card_invoice",
        ]
        | None
    ) = Field(
        default=None,
        description=(
            "utility_water/electricity/gas = conta de água/luz/gás; "
            "condo_fee = taxa de condomínio; "
            "credit_card_invoice = fatura de cartão de crédito"
        ),
    )
    amount: MoneyAmount | None = None
    reference_period: str | None = None
    document_number: str | None = None


class UnclearFields(ExtractionFieldsBase):
    """Fallback when the document doesn't clearly match vehicle, health, or bills,
    or is too illegible to classify with confidence. Never guess a category."""

    category: Literal["unclear"]
    reason: str | None = None


class ExtractionResult(BaseModel):
    fields: VehicleFields | HealthFields | BillsFields | UnclearFields
