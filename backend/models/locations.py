from sqlalchemy import Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core import database

class Location(database.Base):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="", nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    aliases: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=list,
        nullable=False
    )
    location_type: Mapped[str] = mapped_column(String, nullable=False)

    building_id: Mapped[str | None] = mapped_column(
        ForeignKey("buildings.building_id"),
        nullable=True,
    )
    building = relationship(
        "Building",
    )

    floor_id: Mapped[int | None] = mapped_column(
        ForeignKey("floors.floor_id"),
        nullable=True,
    )

    floor = relationship(
        "Floor",
    )

    area_name: Mapped[str | None] = mapped_column(String, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    boundaries: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    nearest_node_id: Mapped[str | None] = mapped_column(String, nullable=True)
    nearest_bus_stop_id: Mapped[str | None] = mapped_column(String, nullable=True)
    
    landmark_hint: Mapped[str | None] = mapped_column(String, nullable=True)
    arrival_instruction: Mapped[str | None] = mapped_column(String, nullable=True)

    crowd_density: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    opening_hours: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    canteen = relationship("Canteen", back_populates="location", uselist=False)
    
    

