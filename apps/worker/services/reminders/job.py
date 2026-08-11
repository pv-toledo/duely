import logging
from datetime import date
from pathlib import Path

import jinja2

from db.reminders_repository import (
    get_eligible_deadlines_for_reminders,
    get_user_email,
    record_notification_sent,
)
from services.reminders.email_client import ResendEmailClient

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
_jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(_TEMPLATES_DIR),
    autoescape=True,
)


def _build_subject(title: str, offset_days: int) -> str:
    if offset_days == 0:
        return f"Reminder: {title} is due today"
    if offset_days == 1:
        return f"Reminder: {title} due in 1 day"
    return f"Reminder: {title} due in {offset_days} days"


def _build_deadline_url(document_id: str | None, app_base_url: str) -> str:
    if document_id is not None:
        return f"{app_base_url}/documents/{document_id}"
    return f"{app_base_url}/deadlines"


def _format_due_date(due_date: date) -> str:
    return due_date.strftime("%B %d, %Y")


async def run_reminder_job(email_client: ResendEmailClient, app_base_url: str) -> None:
    deadlines = await get_eligible_deadlines_for_reminders()
    logger.info("reminder_job_started", extra={"eligible_count": len(deadlines)})

    template = _jinja_env.get_template("reminder.html")

    for deadline in deadlines:
        try:
            await _send_reminder_for_deadline(deadline, template, email_client, app_base_url)
        except Exception:
            logger.exception("reminder_send_failed", extra={"deadline_id": str(deadline.id)})

    logger.info("reminder_job_finished")


async def _send_reminder_for_deadline(
    deadline, template: jinja2.Template, email_client: ResendEmailClient, app_base_url: str
) -> None:
    email = await get_user_email(deadline.user_id)
    if email is None:
        logger.warning("reminder_skipped_no_email", extra={"deadline_id": str(deadline.id)})
        return

    html_content = template.render(
        title=deadline.title,
        due_date_formatted=_format_due_date(deadline.due_date),
        app_url=_build_deadline_url(deadline.document_id, app_base_url),
    )
    subject = _build_subject(deadline.title, deadline.reminder_offset_days)

    await email_client.send_email(to_email=email, subject=subject, html_content=html_content)
    await record_notification_sent(deadline.id, deadline.reminder_offset_days)
