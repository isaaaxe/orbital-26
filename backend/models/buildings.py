from sqlalchemy import Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core import database

class Building(database.Base):
    __tablename__ = "buildings"

    building_id: Mapped[str] = mapped_column(String, primary_key=True)
    building_code: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    aliases: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=list,
        nullable=False
    )
    
    floors = relationship(
        "Floor",
        back_populates="building",
        order_by="Floor.floor_number",
    )

    area_name: Mapped[str | None] = mapped_column(String, nullable=True)
    boundaries: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    entrance_node_id: Mapped[str] = mapped_column(
        ForeignKey("map_nodes.node_id"),
        nullable=True,
    )