import enum

from sqlalchemy import Enum as SAEnum


def pg_text_enum(enum_cls: type[enum.Enum]) -> SAEnum:
    """Column type for a Python Enum backed by the existing `text` + CHECK column,
    not a native Postgres ENUM."""
    return SAEnum(enum_cls, native_enum=False, values_callable=lambda x: [e.value for e in x])


class DocumentStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    NEEDS_REVIEW = "needs_review"
    ARCHIVED = "archived"
    FAILED = "failed"


class DocumentCategory(enum.Enum):
    VEHICLE = "vehicle"
    HEALTH = "health"
    BILLS = "bills"


class DeadlineRecurrence(enum.Enum):
    NONE = "none"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class DeadlineStatus(enum.Enum):
    ACTIVE = "active"
    DONE = "done"
    DISMISSED = "dismissed"
