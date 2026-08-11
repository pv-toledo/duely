import httpx2

RESEND_API_URL = "https://api.resend.com/emails"
SENDER_NAME = "Duely"


class EmailSendError(Exception):
    """Raised when sending a reminder email via Resend fails."""


class ResendEmailClient:
    def __init__(self, api_key: str, sender_email: str) -> None:
        self._client = httpx2.AsyncClient(
            headers={"Authorization": f"Bearer {api_key}", "content-type": "application/json"}
        )
        self._sender_email = sender_email

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        timeout_seconds: float = 30.0,
    ) -> None:
        payload = {
            "from": f"{SENDER_NAME} <{self._sender_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        try:
            response = await self._client.post(
                RESEND_API_URL, json=payload, timeout=timeout_seconds
            )
            response.raise_for_status()
        except httpx2.HTTPStatusError as e:
            raise EmailSendError(f"{e.response.status_code} sending email to {to_email}") from e
        except httpx2.RequestError as e:
            raise EmailSendError(f"network error sending email to {to_email}") from e

    async def aclose(self) -> None:
        await self._client.aclose()
