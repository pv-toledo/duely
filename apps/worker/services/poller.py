import asyncio
import logging
from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

from db.repository import (
    claim_pending_document,
    get_extraction_pause,
    mark_extraction_failed,
    requeue_document,
    save_extraction_result,
    set_extraction_pause,
)
from services.extraction.client import MODEL_NAME, ExtractionError, GeminiExtractionClient
from services.storage import StorageDownloadError, SupabaseStorageClient

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 3
_PACIFIC = ZoneInfo("America/Los_Angeles")


def _next_pacific_midnight() -> datetime:
    now_pacific = datetime.now(_PACIFIC)
    next_midnight = (now_pacific + timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return next_midnight.astimezone(UTC)


class DocumentPoller:
    def __init__(
        self,
        extraction_client: GeminiExtractionClient,
        storage_client: SupabaseStorageClient,
        interval_seconds: float = POLL_INTERVAL_SECONDS,
    ) -> None:
        self._extraction_client = extraction_client
        self._storage_client = storage_client
        self._interval_seconds = interval_seconds
        self._stop_event = asyncio.Event()
        self._task: asyncio.Task | None = None

    def start(self) -> None:
        self._task = asyncio.create_task(self._run())

    async def stop(self) -> None:
        self._stop_event.set()
        if self._task is not None:
            await self._task

    async def _run(self) -> None:
        logger.info("poller_started", extra={"interval_seconds": self._interval_seconds})
        while not self._stop_event.is_set():
            try:
                await self._poll_once()
            except Exception:
                logger.exception("poller_cycle_failed")
            await self._wait_before_next_cycle()
        logger.info("poller_stopped")

    async def _poll_once(self) -> None:
        pause_until = await get_extraction_pause()
        if pause_until is not None:
            return

        document = await claim_pending_document()
        if document is None:
            return
        logger.info("document_claimed", extra={"document_id": str(document.id)})

        try:
            image_bytes = await self._storage_client.download(document.storage_path)
            result = await self._extraction_client.extract_document(image_bytes, document.mime_type)
        except StorageDownloadError as e:
            logger.error("storage_download_failed", extra={"document_id": str(document.id)})
            await mark_extraction_failed(document.id, MODEL_NAME, str(e))
            return
        except ExtractionError as e:
            if e.is_daily_quota_exceeded:
                pause_until = _next_pacific_midnight()
                logger.warning(
                    "daily_quota_exceeded_pausing",
                    extra={
                        "document_id": str(document.id),
                        "paused_until": pause_until.isoformat(),
                    },
                )
                await set_extraction_pause(pause_until)
                await requeue_document(document.id)
                return
            if e.status_code == 429:
                logger.warning(
                    "extraction_quota_exceeded_requeuing",
                    extra={"document_id": str(document.id)},
                )
                await requeue_document(document.id)
                return
            logger.error("extraction_failed", extra={"document_id": str(document.id)})
            await mark_extraction_failed(document.id, MODEL_NAME, str(e))
            return

        await save_extraction_result(document.id, MODEL_NAME, result.fields)
        logger.info(
            "document_processed",
            extra={"document_id": str(document.id), "category": result.fields.category},
        )

    async def _wait_before_next_cycle(self) -> None:
        try:
            await asyncio.wait_for(self._stop_event.wait(), timeout=self._interval_seconds)
        except TimeoutError:
            pass
