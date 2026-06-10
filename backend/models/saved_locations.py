from sqlalchemy import Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, foreign

from core import database

class Saved_Location(database.Base):
    __tablename__ = "saved_locations"

    __table_args__ = (UniqueConstraint("user_id", "location_id", name="unique_save"), )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False,
    )

    location_id: Mapped[str] = mapped_column(
        ForeignKey("locations.id"),
        nullable=False,
    )

    purpose: Mapped[str] = mapped_column(String, default="", nullable=False)

    user = relationship(
        "User",
        back_populates="saved_locations"
    )

    location = relationship(
        "Location",
    )
