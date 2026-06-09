from sqlalchemy import Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, foreign
from datetime import datetime, timezone

from core import database

class Recent_Location(database.Base):
    __tablename__ = "recent_locations"

    __table_args__ = (UniqueConstraint("user_id", "location_id", name="unique_recent"), )

    recent_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default = lambda: datetime.now(timezone.utc),
        nullable = False,
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False,
    )

    location_id: Mapped[str] = mapped_column(
        ForeignKey("locations.id"),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="recent_locations"
    )

    location = relationship(
        "Location",
    )