import httpx2

BUCKET_NAME = "documents"


class StorageDownloadError(Exception):
    """Raised when downloading a file from Supabase Storage fails."""


class SupabaseStorageClient:
    def __init__(self, supabase_url: str, secret_key: str) -> None:
        self._base_url = f"{supabase_url}/storage/v1/object/{BUCKET_NAME}"
        self._client = httpx2.AsyncClient(headers={"apikey": secret_key})

    async def download(self, storage_path: str, timeout_seconds: float = 30.0) -> bytes:
        url = f"{self._base_url}/{storage_path}"
        try:
            response = await self._client.get(url, timeout=timeout_seconds)
            response.raise_for_status()
        except httpx2.HTTPStatusError as e:
            raise StorageDownloadError(
                f"{e.response.status_code} downloading {storage_path}"
            ) from e
        except httpx2.RequestError as e:
            raise StorageDownloadError(f"network error downloading {storage_path}") from e

        return response.content

    async def aclose(self) -> None:
        await self._client.aclose()
