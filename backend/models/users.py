from sqlalchemy import Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, foreign

from core import database

class User(database.Base):
    __tablename__ = "users"

    __table_args__ = (
        UniqueConstraint("username", name="unique_username"),
    )

    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    language: Mapped[str] = mapped_column(String, nullable=False)
    pace_factor: Mapped[float] = mapped_column(Float, nullable=False)
    shelter_pref: Mapped[float] = mapped_column(Float, nullable=False)

    saved_locations = relationship(
        "Saved_Location",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    recent_locations = relationship(
        "Recent_Location",
        back_populates="user",
        cascade="all, delete-orphan",
    )
