from collections.abc import AsyncGenerator

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from config import settings

_url = make_url(settings.database_url).set(drivername="postgresql+asyncpg", query={})

engine = create_async_engine(_url, pool_pre_ping=True, connect_args={"ssl": "require"})

async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
