import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.health import router as health_router
from services.poller import DocumentPoller

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    poller = DocumentPoller()
    poller.start()
    yield
    await poller.stop()


app = FastAPI(lifespan=lifespan)
app.include_router(health_router)
