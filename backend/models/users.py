from sqlalchemy import Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, foreign

from core import database

class User(database.Base):
    __tablename__ = "users"

    __table_args__ = UniqueConstraint("user_id", "username", name="unique_username")

    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, nullable=False)
    language: Mapped[str] = mapped_column(String, nullable=False)
    profile_settings: Mapped[list[str]] = mapped_column(
        JSONB,
        default = list,
        nullable=False,
    )

    saved_locations = relationship(
        "Saved_Location",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    