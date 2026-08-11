import asyncio

from config import settings
from services.reminders.email_client import ResendEmailClient
from services.reminders.job import run_reminder_job


async def main() -> None:
    email_client = ResendEmailClient(
        api_key=settings.resend_api_key, sender_email=settings.resend_sender_email
    )
    try:
        await run_reminder_job(email_client, settings.app_base_url)
    finally:
        await email_client.aclose()


if __name__ == "__main__":
    asyncio.run(main())
