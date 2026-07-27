import enum

from sqlalchemy import Enum as SAEnum


def pg_text_enum(enum_cls: type[enum.Enum]) -> SAEnum:
    """Column type for a Python Enum backed by the existing `text` + CHECK column,
    not a native Postgres ENUM."""
    return SAEnum(enum_cls, native_enum=False, values_callable=lambda x: [e.value for e in x])
