import asyncio
import logging

from db.repository import claim_pending_document, mark_needs_review

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 3


class DocumentPoller:
    def __init__(self, interval_seconds: float = POLL_INTERVAL_SECONDS) -> None:
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
        document = await claim_pending_document()
        if document is None:
            return
        logger.info("document_claimed", extra={"document_id": str(document.id)})
        await mark_needs_review(document.id)
        logger.info("document_marked_needs_review", extra={"document_id": str(document.id)})

    async def _wait_before_next_cycle(self) -> None:
        try:
            await asyncio.wait_for(self._stop_event.wait(), timeout=self._interval_seconds)
        except TimeoutError:
            pass
