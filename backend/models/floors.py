from sqlalchemy import Integer, String, Float, UniqueConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core import database

class Floor(database.Base):
    __tablename__ = "floors"

    __table_args__ = (UniqueConstraint("floor_number", "building_id", name="unique_floor"), )

    floor_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    floor_number: Mapped[int] = mapped_column(Integer, nullable=False)
    floor_name: Mapped[str] = mapped_column(String, nullable=False)

    building_id: Mapped[str] = mapped_column(
        ForeignKey("buildings.building_id"),
        nullable=False,
    )
    building = relationship(
        "Building",
        back_populates="floors",
    )
    geo_reference: Mapped[list[list[float]]] = mapped_column(
        JSONB,
        nullable=False,
    )

    image_url: Mapped[str] = mapped_column(String, nullable=False)
    image_width: Mapped[int] = mapped_column(Integer, nullable=False)
    image_height: Mapped[int] = mapped_column(Integer, nullable=False)
