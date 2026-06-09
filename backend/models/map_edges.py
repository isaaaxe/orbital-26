from sqlalchemy import Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, foreign

from core import database

class Map_Edge(database.Base):
    __tablename__ = "map_edges"

    edge_id: Mapped[str] = mapped_column(String, primary_key=True)

    from_node_id: Mapped[str] = mapped_column(
        ForeignKey("map_nodes.node_id"),
        nullable=False,
    )
    from_node = relationship(
        "Map_Node",
        foreign_keys=[from_node_id],
        back_populates="out_edges",
    )

    to_node_id: Mapped[str] = mapped_column(
        ForeignKey("map_nodes.node_id"),
        nullable=False,
    )

    to_node = relationship(
        "Map_Node",
        foreign_keys=[to_node_id],
        back_populates="in_edges",
    )

    mode: Mapped[str] = mapped_column(String, nullable=False)
    is_sheltered: Mapped[bool] = mapped_column(Boolean, default=False ,nullable=False)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    distance_m: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_seconds: Mapped[float] = mapped_column(Float, nullable=False)

    instruction: Mapped[str | None] = mapped_column(String, nullable=True)
    #switch to LINESTRING in the future
    geometry: Mapped[list[list[float]]] = mapped_column(
        JSONB,
        default=list,
        nullable=False,
    )
