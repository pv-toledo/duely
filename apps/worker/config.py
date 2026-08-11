# apps/worker/config.py
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_FILE, env_file_encoding="utf-8")

    database_url: str
    supabase_url: str
    supabase_secret_key: str
    google_gemini_api_key: str
    resend_api_key: str
    resend_sender_email: str
    app_base_url: str


settings = Settings()
