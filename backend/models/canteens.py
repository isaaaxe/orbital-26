from sqlalchemy import Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core import database

class Canteen(database.Base):
    __tablename__ = "canteens"

    location_id: Mapped[str] = mapped_column(
        ForeignKey("locations.id"),
        primary_key=True,
    )

    halal_availability: Mapped[bool] = mapped_column(Boolean, nullable=False)
    stalls: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=list,
        nullable=False
    ) 

    location = relationship(
        "Location",
        back_populates="canteen",
    )
