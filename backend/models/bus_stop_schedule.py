from sqlalchemy import Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core import database

class BusStopSchedule(database.Base):
    __tablename__ = "bus_stop_schedules"

    bus_id: Mapped[int] = mapped_column(ForeignKey("buses.bus_id"), primary_key=True)
    bus_stop_id: Mapped[str] = mapped_column(ForeignKey("bus_stops.bus_stop_id"), primary_key=True)

    schedule: Mapped[int] = mapped_column(Integer, nullable=True)
    bus = relationship("Bus", back_populates="bus_stop_links", foreign_keys=[bus_id])
    bus_stop = relationship("Bus_Stop", back_populates="bus_links", foreign_keys=[bus_stop_id])