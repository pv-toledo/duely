from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from services.extraction.client import MODEL_NAME, ExtractionError, GeminiExtractionClient
from services.poller import DocumentPoller
from services.storage import StorageDownloadError, SupabaseStorageClient

pytestmark = pytest.mark.anyio


def _fake_document():
    return SimpleNamespace(id=uuid4(), storage_path="user/doc.webp", mime_type="image/webp")


def _fake_extraction_result():
    return SimpleNamespace(fields=SimpleNamespace(category="bills"))


@pytest.fixture
def poller():
    extraction_client = AsyncMock(spec=GeminiExtractionClient)
    storage_client = AsyncMock(spec=SupabaseStorageClient)
    return DocumentPoller(extraction_client=extraction_client, storage_client=storage_client)


async def test_paused_skips_claim_entirely(poller):
    with (
        patch("services.poller.get_extraction_pause", new_callable=AsyncMock) as mock_get_pause,
        patch("services.poller.claim_pending_document", new_callable=AsyncMock) as mock_claim,
    ):
        mock_get_pause.return_value = datetime(2026, 8, 4, tzinfo=UTC)

        await poller._poll_once()

        mock_claim.assert_not_called()


async def test_no_pending_document_does_nothing(poller):
    with (
        patch("services.poller.get_extraction_pause", new_callable=AsyncMock) as mock_get_pause,
        patch("services.poller.claim_pending_document", new_callable=AsyncMock) as mock_claim,
    ):
        mock_get_pause.return_value = None
        mock_claim.return_value = None

        await poller._poll_once()

        poller._storage_client.download.assert_not_called()
        poller._extraction_client.extract_document.assert_not_called()


async def test_successful_extraction_saves_result(poller):
    document = _fake_document()
    result = _fake_extraction_result()

    with (
        patch("services.poller.get_extraction_pause", new_callable=AsyncMock) as mock_get_pause,
        patch("services.poller.claim_pending_document", new_callable=AsyncMock) as mock_claim,
        patch("services.poller.save_extraction_result", new_callable=AsyncMock) as mock_save,
    ):
        mock_get_pause.return_value = None
        mock_claim.return_value = document
        poller._storage_client.download.return_value = b"fake-bytes"
        poller._extraction_client.extract_document.return_value = result

        await poller._poll_once()

        mock_save.assert_called_once_with(document.id, MODEL_NAME, result.fields)


async def test_storage_failure_marks_document_failed(poller):
    document = _fake_document()

    with (
        patch("services.poller.get_extraction_pause", new_callable=AsyncMock) as mock_get_pause,
        patch("services.poller.claim_pending_document", new_callable=AsyncMock) as mock_claim,
        patch("services.poller.mark_extraction_failed", new_callable=AsyncMock) as mock_failed,
    ):
        mock_get_pause.return_value = None
        mock_claim.return_value = document
        poller._storage_client.download.side_effect = StorageDownloadError("404 not found")

        await poller._poll_once()

        mock_failed.assert_called_once()
        assert mock_failed.call_args.args[0] == document.id
        poller._extraction_client.extract_document.assert_not_called()


async def test_transient_429_requeues_without_pausing(poller):
    document = _fake_document()

    with (
        patch("services.poller.get_extraction_pause", new_callable=AsyncMock) as mock_get_pause,
        patch("services.poller.claim_pending_document", new_callable=AsyncMock) as mock_claim,
        patch("services.poller.requeue_document", new_callable=AsyncMock) as mock_requeue,
        patch("services.poller.set_extraction_pause", new_callable=AsyncMock) as mock_set_pause,
    ):
        mock_get_pause.return_value = None
        mock_claim.return_value = document
        poller._storage_client.download.return_value = b"fake-bytes"
        poller._extraction_client.extract_document.side_effect = ExtractionError(
            "429: RESOURCE_EXHAUSTED", status_code=429, is_daily_quota_exceeded=False
        )

        await poller._poll_once()

        mock_requeue.assert_called_once_with(document.id)
        mock_set_pause.assert_not_called()


async def test_daily_quota_exceeded_pauses_and_requeues(poller):
    document = _fake_document()
    fixed_midnight = datetime(2026, 8, 4, 7, 0, tzinfo=UTC)

    with (
        patch("services.poller.get_extraction_pause", new_callable=AsyncMock) as mock_get_pause,
        patch("services.poller.claim_pending_document", new_callable=AsyncMock) as mock_claim,
        patch("services.poller.requeue_document", new_callable=AsyncMock) as mock_requeue,
        patch("services.poller.set_extraction_pause", new_callable=AsyncMock) as mock_set_pause,
        patch("services.poller._next_pacific_midnight", return_value=fixed_midnight),
    ):
        mock_get_pause.return_value = None
        mock_claim.return_value = document
        poller._storage_client.download.return_value = b"fake-bytes"
        poller._extraction_client.extract_document.side_effect = ExtractionError(
            "429: RESOURCE_EXHAUSTED", status_code=429, is_daily_quota_exceeded=True
        )

        await poller._poll_once()

        mock_set_pause.assert_called_once_with(fixed_midnight)
        mock_requeue.assert_called_once_with(document.id)


async def test_other_extraction_error_marks_failed(poller):
    document = _fake_document()

    with (
        patch("services.poller.get_extraction_pause", new_callable=AsyncMock) as mock_get_pause,
        patch("services.poller.claim_pending_document", new_callable=AsyncMock) as mock_claim,
        patch("services.poller.mark_extraction_failed", new_callable=AsyncMock) as mock_failed,
    ):
        mock_get_pause.return_value = None
        mock_claim.return_value = document
        poller._storage_client.download.return_value = b"fake-bytes"
        poller._extraction_client.extract_document.side_effect = ExtractionError(
            "400: content blocked", status_code=400
        )

        await poller._poll_once()

        mock_failed.assert_called_once()
        assert mock_failed.call_args.args[0] == document.id
