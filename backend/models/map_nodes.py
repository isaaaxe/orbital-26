from sqlalchemy import Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core import database

class Map_Node(database.Base):
    __tablename__ = "map_nodes"

    node_id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    node_type: Mapped[str] = mapped_column(String, nullable=False) #corner, entrance, bus stop etc
    
    building_id: Mapped[str | None] = mapped_column(
        ForeignKey("buildings.building_id"),
        nullable=True,
    )
    building = relationship(
        "Building",
        foreign_keys=[building_id],
    )
    
    floor: Mapped[int] = mapped_column(Integer, nullable=False)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    out_edges = relationship(
        "Map_Edge",
        foreign_keys="Map_Edge.from_node_id",
        back_populates="from_node",
    )

    in_edges = relationship(
        "Map_Edge",
        foreign_keys="Map_Edge.to_node_id",
        back_populates="to_node",
    )


