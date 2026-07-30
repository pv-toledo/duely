from sqlalchemy import select, update

from db.models import Document
from db.session import async_session_factory


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


async def mark_needs_review(document_id: str) -> None:
    async with async_session_factory() as session:
        stmt = update(Document).where(Document.id == document_id).values(status="needs_review")
        await session.execute(stmt)
        await session.commit()
