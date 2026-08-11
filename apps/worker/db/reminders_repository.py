from datetime import UTC, datetime, timedelta
from uuid import UUID as PyUUID

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert

from db.models import Deadline, NotificationLog
from db.session import async_session_factory


async def get_user_email(user_id: PyUUID) -> str | None:
    async with async_session_factory() as session:
        result = await session.execute(
            text("select email from auth.users where id = :user_id"),
            {"user_id": user_id},
        )
        row = result.first()
        return row[0] if row else None


async def get_eligible_deadlines_for_reminders() -> list[Deadline]:
    """Active deadlines whose own reminder_offset_days, subtracted from
    due_date, lands on today (UTC) -- excluding ones
    that already have a notification_log row for that exact offset."""
    async with async_session_factory() as session:
        today = datetime.now(UTC).date()

        candidates_result = await session.execute(
            select(Deadline).where(
                Deadline.status == "active",
                Deadline.reminder_offset_days.is_not(None),
            )
        )
        candidates = [
            d
            for d in candidates_result.scalars().all()
            if d.due_date - timedelta(days=d.reminder_offset_days) == today
        ]
        if not candidates:
            return []

        sent_result = await session.execute(
            select(NotificationLog.deadline_id, NotificationLog.offset_days).where(
                NotificationLog.deadline_id.in_([d.id for d in candidates])
            )
        )
        already_sent = {(row.deadline_id, row.offset_days) for row in sent_result}

        return [d for d in candidates if (d.id, d.reminder_offset_days) not in already_sent]


async def record_notification_sent(deadline_id: PyUUID, offset_days: int) -> bool:
    """Logs a reminder as sent, called only after the email call already
    succeeded (send-first, log-after). ON CONFLICT DO NOTHING is a
    defensive backstop, not the primary guard -- get_eligible_deadlines_
    for_reminders() already excludes already-sent windows."""
    async with async_session_factory() as session:
        stmt = (
            pg_insert(NotificationLog)
            .values(deadline_id=deadline_id, offset_days=offset_days)
            .on_conflict_do_nothing(index_elements=["deadline_id", "offset_days"])
            .returning(NotificationLog.id)
        )
        result = await session.execute(stmt)
        await session.commit()
        return result.scalar_one_or_none() is not None
