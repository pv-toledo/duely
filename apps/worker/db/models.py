from datetime import date, datetime
from decimal import Decimal
from uuid import UUID as PyUUID

from sqlalchemy import ForeignKey, Numeric, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base
from db.enums import (
    DeadlineRecurrence,
    DeadlineStatus,
    DocumentCategory,
    DocumentStatus,
    pg_text_enum,
)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[PyUUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[PyUUID]
    storage_path: Mapped[str]
    original_filename: Mapped[str]
    mime_type: Mapped[str]
    status: Mapped[DocumentStatus] = mapped_column(
        pg_text_enum(DocumentStatus), server_default="pending"
    )  # noqa: E501
    category: Mapped[DocumentCategory | None] = mapped_column(pg_text_enum(DocumentCategory))
    document_type: Mapped[str | None]
    subject_name: Mapped[str | None]
    issuer_name: Mapped[str | None]
    title: Mapped[str | None]
    search_language: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))


class Extraction(Base):
    __tablename__ = "extractions"

    id: Mapped[PyUUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    document_id: Mapped[PyUUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), unique=True
    )
    model: Mapped[str]
    raw_response: Mapped[dict] = mapped_column(JSONB)
    document_number: Mapped[str | None]
    plate: Mapped[str | None]
    document_date: Mapped[date | None]
    description: Mapped[str | None]
    reference_period: Mapped[str | None]
    error_message: Mapped[str | None]
    processed_at: Mapped[datetime | None]


class ExtractionStatus(Base):
    __tablename__ = "extraction_status"

    key: Mapped[str] = mapped_column(primary_key=True)
    paused_until: Mapped[datetime | None]
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))


class Deadline(Base):
    __tablename__ = "deadlines"

    id: Mapped[PyUUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[PyUUID]
    document_id: Mapped[PyUUID | None] = mapped_column(
        ForeignKey("documents.id", ondelete="SET NULL")
    )
    title: Mapped[str]
    due_date: Mapped[date]
    amount: Mapped[Decimal | None] = mapped_column(Numeric)
    recurrence: Mapped[DeadlineRecurrence] = mapped_column(
        pg_text_enum(DeadlineRecurrence), server_default="none"
    )  # noqa: E501
    status: Mapped[DeadlineStatus] = mapped_column(
        pg_text_enum(DeadlineStatus), server_default="active"
    )  # noqa: E501
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))


class NotificationLog(Base):
    __tablename__ = "notification_log"
    __table_args__ = (UniqueConstraint("deadline_id", "offset_days"),)

    id: Mapped[PyUUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    deadline_id: Mapped[PyUUID] = mapped_column(ForeignKey("deadlines.id", ondelete="CASCADE"))
    channel: Mapped[str] = mapped_column(server_default="email")
    offset_days: Mapped[int]
    sent_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
