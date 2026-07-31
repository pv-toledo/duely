import logging

from google import genai
from google.genai import errors, types

from services.extraction.schemas import ExtractionResult

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-3.1-flash-lite"

_RETRY_STATUS_CODES = [500, 502, 503, 504]

_SYSTEM_INSTRUCTION = """
You are a document classification and extraction system for a personal \
document management app used in Brazil. You receive a photo or scan of a \
single document, in Portuguese or English.

Classify the document into exactly one of: vehicle, health, bills. If it \
doesn't clearly match any of the three, or is too unclear or illegible to \
classify with confidence, use "unclear" instead of guessing.

Critical rule: only fill a field if its value is explicitly and \
unambiguously visible in the document. If a field is missing, illegible, \
or would require inference, return null for it. Never guess.

Dates: always output ISO 8601 (YYYY-MM-DD), regardless of the format shown \
on the document.

Names and proper nouns: extract exactly as written. Do not translate names \
of people, companies, or institutions.
""".strip()


class ExtractionError(Exception):
    """Raised when the Gemini call fails or returns something that doesn't
    validate against the schema, after the SDK's own retries are exhausted."""


class GeminiExtractionClient:
    def __init__(self, api_key: str) -> None:
        self._client = genai.Client(api_key=api_key)

    async def extract_document(
        self,
        image_bytes: bytes,
        mime_type: str,
        timeout_seconds: float = 60.0,
    ) -> ExtractionResult:
        try:
            response = await self._client.aio.models.generate_content(
                model=MODEL_NAME,
                contents=[
                    "Classify and extract this document.",
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                ],
                config=types.GenerateContentConfig(
                    system_instruction=_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=ExtractionResult,
                    temperature=0,
                    http_options=types.HttpOptions(
                        timeout=int(timeout_seconds * 1000),
                        retry_options=types.HttpRetryOptions(
                            http_status_codes=_RETRY_STATUS_CODES,
                        ),
                    ),
                ),
            )
        except errors.APIError as e:
            logger.error("Gemini call failed: %s %s", e.code, e.message)
            raise ExtractionError(f"{e.code}: {e.message}") from e

        if response.parsed is None:
            raise ExtractionError("Gemini response didn't match the schema.")

        return response.parsed
