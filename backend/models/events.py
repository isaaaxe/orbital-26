from datetime import date
from sqlalchemy import Integer, String, Float, Date
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from core import database

class Event(database.Base):
    __tablename__ = "events"

    event_id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    description: Mapped[str] = mapped_column(String, nullable= False)
    categories: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=list,
        nullable=False
    )
    audiences: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=list,
        nullable=False
    )


    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    event_url: Mapped[str] = mapped_column(String, nullable=False)
