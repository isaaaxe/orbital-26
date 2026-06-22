from sqlalchemy import Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.associationproxy import association_proxy

from core import database

class Bus(database.Base):
    __tablename__ = "buses"

    bus_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    bus_number: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    bus_stop_links = relationship("BusStopSchedule", back_populates="bus")
    bus_stops = association_proxy("bus_stop_links", "bus_stop")
