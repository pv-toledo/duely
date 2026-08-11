import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.health import router as health_router
from config import settings
from services.extraction.client import GeminiExtractionClient
from services.poller import DocumentPoller
from services.reminders.email_client import ResendEmailClient
from services.reminders.scheduler import build_reminder_scheduler
from services.storage import SupabaseStorageClient

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    extraction_client = GeminiExtractionClient(api_key=settings.google_gemini_api_key)
    storage_client = SupabaseStorageClient(
        supabase_url=settings.supabase_url,
        secret_key=settings.supabase_secret_key,
    )
    poller = DocumentPoller(extraction_client=extraction_client, storage_client=storage_client)
    poller.start()

    email_client = ResendEmailClient(
        api_key=settings.resend_api_key, sender_email=settings.resend_sender_email
    )
    reminder_scheduler = build_reminder_scheduler(
        email_client=email_client, app_base_url=settings.app_base_url
    )
    reminder_scheduler.start()

    yield

    reminder_scheduler.shutdown()
    await email_client.aclose()
    await poller.stop()
    await storage_client.aclose()


app = FastAPI(lifespan=lifespan)
app.include_router(health_router)
