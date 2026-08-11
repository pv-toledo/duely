from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from services.reminders.email_client import ResendEmailClient
from services.reminders.job import run_reminder_job

REMINDER_JOB_HOUR_UTC = 12


def build_reminder_scheduler(
    email_client: ResendEmailClient, app_base_url: str
) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(
        run_reminder_job,
        trigger=CronTrigger(hour=REMINDER_JOB_HOUR_UTC, minute=0),
        args=[email_client, app_base_url],
        id="daily_reminder_job",
    )
    return scheduler
