import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.health import router as health_router
from config import settings
from services.extraction.client import GeminiExtractionClient
from services.poller import DocumentPoller
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
    yield
    await poller.stop()
    await storage_client.aclose()


app = FastAPI(lifespan=lifespan)
app.include_router(health_router)
