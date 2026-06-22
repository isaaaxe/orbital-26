from sqlalchemy import Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.associationproxy import association_proxy

from core import database

class Bus_Stop(database.Base):
    __tablename__ = "bus_stops"

    bus_stop_id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

    node_id: Mapped[str | None] = mapped_column(
        ForeignKey("map_nodes.node_id"),
        nullable=True,
    )
    map_node = relationship("Map_Node", foreign_keys=[node_id])

    bus_links = relationship("BusStopSchedule", back_populates="bus_stop")
    buses = association_proxy("bus_links", "bus")


