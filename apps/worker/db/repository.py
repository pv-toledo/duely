from datetime import datetime
from uuid import UUID as PyUUID

from sqlalchemy import func, insert, select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert

from db.models import Document, Extraction, ExtractionStatus
from db.session import async_session_factory
from services.extraction.schemas import BillsFields, HealthFields, UnclearFields, VehicleFields

EXTRACTION_STATUS_KEY = "gemini_daily_quota"


async def claim_pending_document() -> Document | None:
    async with async_session_factory() as session:
        subquery = (
            select(Document.id)
            .where(Document.status == "pending")
            .order_by(Document.created_at)
            .with_for_update(skip_locked=True)
            .limit(1)
            .scalar_subquery()
        )
        stmt = (
            update(Document)
            .where(Document.id == subquery)
            .values(status="processing")
            .returning(Document)
        )
        result = await session.execute(stmt)
        document = result.scalar_one_or_none()
        await session.commit()
        return document


async def save_extraction_result(
    document_id: PyUUID,
    model: str,
    fields: VehicleFields | HealthFields | BillsFields | UnclearFields,
) -> None:
    """Persists a successful extraction -- including the "unclear" category,
    since human review is always required regardless of confidence (section 9)."""
    document_values: dict[str, str | None] = {
        "subject_name": fields.subject_name,
        "issuer_name": fields.issuer_name,
        "status": "needs_review",
    }
    if fields.category != "unclear":
        document_values["category"] = fields.category
        document_values["document_type"] = fields.document_type

    async with async_session_factory() as session:
        await session.execute(
            update(Document).where(Document.id == document_id).values(**document_values)
        )
        await session.execute(
            insert(Extraction).values(
                document_id=document_id,
                model=model,
                raw_response=fields.model_dump(mode="json"),
                document_number=getattr(fields, "document_number", None),
                plate=getattr(fields, "plate", None),
                document_date=getattr(fields, "document_date", None),
                description=getattr(fields, "description", None),
                reference_period=getattr(fields, "reference_period", None),
                processed_at=func.now(),
            )
        )
        await session.commit()


async def mark_extraction_failed(document_id: PyUUID, model: str, error_message: str) -> None:
    """Non-retryable technical failure: blocked content, malformed response,
    storage error. raw_response has nothing real to store, so it's an empty
    object -- error_message carries the actual reason."""
    async with async_session_factory() as session:
        await session.execute(
            update(Document).where(Document.id == document_id).values(status="failed")
        )
        await session.execute(
            insert(Extraction).values(
                document_id=document_id,
                model=model,
                raw_response={},
                error_message=error_message,
                processed_at=func.now(),
            )
        )
        await session.commit()


async def requeue_document(document_id: PyUUID) -> None:
    """429 (any kind): not a real failure, just quota. No extractions row --
    this document hasn't really been processed yet, just deferred. Puts it
    back where claim_pending_document will find it again."""
    async with async_session_factory() as session:
        await session.execute(
            update(Document).where(Document.id == document_id).values(status="pending")
        )
        await session.commit()


async def get_extraction_pause() -> datetime | None:
    """Returns the pause end time if the daily Gemini quota is currently
    exhausted, or None if there's no active pause. The comparison happens in
    SQL (paused_until > now()) so it's Postgres's clock deciding, not ours."""
    async with async_session_factory() as session:
        result = await session.execute(
            select(ExtractionStatus.paused_until).where(
                ExtractionStatus.key == EXTRACTION_STATUS_KEY,
                ExtractionStatus.paused_until > func.now(),
            )
        )
        return result.scalar_one_or_none()


async def set_extraction_pause(paused_until: datetime) -> None:
    async with async_session_factory() as session:
        stmt = pg_insert(ExtractionStatus).values(
            key=EXTRACTION_STATUS_KEY, paused_until=paused_until, updated_at=func.now()
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=[ExtractionStatus.key],
            set_={"paused_until": paused_until, "updated_at": func.now()},
        )
        await session.execute(stmt)
        await session.commit()
