from sqlalchemy import Integer, String, Float
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from core import database

class Location(database.Base):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    aliases: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=list,
        nullable=False
    )
    location_type: Mapped[str] = mapped_column(String, nullable=False)

    building_code: Mapped[str | None] = mapped_column(String, nullable=True)
    building_name: Mapped[str | None] = mapped_column(String, nullable=True)
    floor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    available_floors: Mapped[list[int]] = mapped_column(
        ARRAY(Integer),
        default=list,
        nullable=False
    )

    area_name: Mapped[str | None] = mapped_column(String, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    nearest_node_id: Mapped[str | None] = mapped_column(String, nullable=True)
    nearest_bus_stop_id: Mapped[str | None] = mapped_column(String, nullable=True)
    
    landmark_hint: Mapped[str | None] = mapped_column(String, nullable=True)
    arrival_instruction: Mapped[str | None] = mapped_column(String, nullable=True)
    
    

