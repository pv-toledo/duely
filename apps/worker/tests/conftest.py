import os

import pytest


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SECRET_KEY", "sb_secret_test")
os.environ.setdefault("GOOGLE_GEMINI_API_KEY", "genai_key_test")
os.environ.setdefault("RESEND_API_KEY", "re_test_key")
os.environ.setdefault("RESEND_SENDER_EMAIL", "reminders@test.pvtoledo.dev")
os.environ.setdefault("APP_BASE_URL", "https://test.duely-app.vercel.app")
