import asyncio
import sys
import os
import json
import re
from datetime import date, datetime
from pathlib import Path
from sqlalchemy import update
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.database import AsyncSessionLocal
from models.events import Event

EVENT_DATA_JSON = Path(os.getenv("OSA_EVENTS_JSON", Path(__file__).parent / "osa_events.json"))
_DASH = re.compile(r"\s*[-–—]\s*")
_FMT = "%d %b %Y"

def load_events_json() -> list[dict]:
    if not EVENT_DATA_JSON.exists():
        raise FileNotFoundError(f"{EVENT_DATA_JSON} not found — run the scraper first")
    data = json.loads(EVENT_DATA_JSON.read_text())
    print(f"  loaded {EVENT_DATA_JSON}: {len(data)} events")
    return data

def parse_date_range(raw: str) -> tuple[date, date]:
    """'10 Jul 2026 - 11 Jul 2026' -> (2026-07-10, 2026-07-11)
       '29 Jul 2026'               -> (2026-07-29, 2026-07-29)"""
    cleaned = raw.replace("\xa0", " ").strip()
    if not cleaned:
        raise ValueError("empty date string")

    parts = _DASH.split(cleaned)
    if len(parts) not in (1, 2):
        raise ValueError(f"unexpected date range {raw!r}: got {len(parts)} parts")

    try:
        start = datetime.strptime(parts[0], _FMT).date()
        end = datetime.strptime(parts[1], _FMT).date() if len(parts) == 2 else start
    except ValueError as e:
        # would not be able to parse compact ranges like 1-8 Jul 2026, but this format is not raised as of 10 jul 2026
        raise ValueError(f"cannot parse date {raw!r}: {e}") from e

    if end < start:
        raise ValueError(f"end before start in {raw!r}")

    return start, end

def validate_specs(raw_events: list[dict]) -> None:
    seen = set()
    for raw in raw_events:
        eid = raw["id"]
        if eid in seen:
            raise ValueError(f"duplicate event_id {eid!r} in {EVENT_DATA_JSON}")
        seen.add(eid)

async def clear_existing_data(session):
    await session.execute(Event.__table__.delete())


async def seed_data(clear_first: bool = True):
    print("Loading OSA events...")
    raw_events = load_events_json()
    validate_specs(raw_events)

    async with AsyncSessionLocal() as session:
        try:
            if clear_first:
                await clear_existing_data(session)

            events = []
            for raw in raw_events:
                start_date, end_date = parse_date_range(raw["date"])
                events.append(Event(
                    event_id=raw["id"],
                    name=raw["title"],
                    start_date=start_date,
                    end_date=end_date,
                    description=raw.get("description") or "",
                    categories=raw.get("categories") or [],
                    audiences=raw.get("audiences") or [],
                    image_url=raw.get("image"),
                    event_url=raw["url"],
                ))

            session.add_all(events)
            await session.commit()
            print("Seed events inserted successfully.")
            print(f"  Events: {len(events)}")

        except Exception:
            await session.rollback()
            print("Seed events failed. Rolled back changes.")
            raise

if __name__ == "__main__":
    asyncio.run(seed_data(clear_first=True))
            
