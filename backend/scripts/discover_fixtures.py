"""
discover_fixtures.py — introspect the seeded Supabase DB and print REAL fixture
values to paste into test_input.py. Run from the project root (same env that has
DATABASE_URL set), e.g.:

    python discover_fixtures.py

It does NOT mutate anything; it only reads. Output is paste-ready Python.

Note on expected_ids: for location search / by-type it replicates the repo's
SQL filter to derive the set. That makes those cases a *consistency* check
(endpoint vs. an independent query of the same data), not a hand-authored
golden. Eyeball the printed sets once; if a result looks wrong, that's a finding,
not something to paste blindly.
"""

import asyncio
from collections import deque

from sqlalchemy import select, or_, func

from core.database import AsyncSessionLocal
from models import (
    Location, Building, Floor, Map_Node, Map_Edge, Bus_Stop, Bus,
)


def header(t):
    print(f"\n# ===== {t} =====")


async def locations(session):
    header("LOCATIONS (pick ids for get_location / saves / recent)")
    rows = (await session.execute(
        select(Location.id, Location.name, Location.location_type).limit(15))).all()
    for lid, name, ltype in rows:
        print(f"#   id={lid!r:40} type={ltype!r:18} name={name!r}")

    header("LOCATION TYPES (pick one with a healthy count for get_location_by_type)")
    type_rows = (await session.execute(
        select(Location.location_type, func.count())
        .group_by(Location.location_type).order_by(func.count().desc()))).all()
    for ltype, cnt in type_rows:
        print(f"#   {ltype!r:20} -> {cnt} rows")

    # ready-to-paste by-type case for the most populous type
    if type_rows:
        ltype = type_rows[0][0]
        ids = {r[0] for r in (await session.execute(
            select(Location.id).where(Location.location_type == ltype))).all()}
        print(f"\nget_location_by_type = [")
        print(f"    TypeCase(location_type={ltype!r}, expected_status=200, expected_ids={ids!r}),")
        print(f"    TypeCase(location_type='zzzznotatype', expected_status=200, expected_ids=set()),")
        print(f"]")

    # ready-to-paste search case: take a distinctive token from the first location's name
    if rows:
        first_name = rows[0][1] or ""
        token = first_name.split()[0] if first_name.split() else first_name
        if token:
            stmt = select(Location.id).where(
                or_(
                    Location.name.ilike(f"%{token}%"),
                    Location.display_name.ilike(f"%{token}%"),
                    func.array_to_string(Location.aliases, " ").ilike(f"%{token}%"),
                )
            )
            ids = {r[0] for r in (await session.execute(stmt)).all()}
            print(f"\nsearch_locations = [")
            print(f"    SearchCase(query={token!r}, expected_status=200, expected_ids={ids!r}),")
            print(f"    SearchCase(query='zzzznotathing', expected_status=200, expected_ids=set()),")
            print(f"]")
            print(f"#   (verify the set above matches what /locations/search?q={token} returns)")


async def buildings_and_floors(session):
    header("BUILDINGS")
    brows = (await session.execute(
        select(Building.building_id, Building.name))).all()
    for bid, name in brows:
        print(f"#   building_id={bid!r:18} name={name!r}")

    header("BUILDINGS WITH FLOORS (use one of these for get_building_floors / get_floor)")
    floor_rows = (await session.execute(
        select(Floor.building_id, Floor.floor_number).order_by(Floor.building_id, Floor.floor_number))).all()
    by_building = {}
    for bid, fnum in floor_rows:
        by_building.setdefault(bid, []).append(fnum)
    for bid, floors in by_building.items():
        print(f"#   {bid!r:18} floors={floors}")

    # ready-to-paste building search
    if brows:
        token = (brows[0][1] or "")[:3]
        print(f"\n# search_buildings: query a building-name substring like {token!r}")


async def buses(session):
    header("BUSES (bus_number for get_bus)")
    for (bn,) in (await session.execute(select(Bus.bus_number))).all():
        print(f"#   bus_number={bn!r}")

    header("BUS STOPS with node_id (these appear in /bus_stop/all; use one for get_bus_stop_by_id)")
    srows = (await session.execute(
        select(Bus_Stop.bus_stop_id, Bus_Stop.name, Bus_Stop.node_id)
        .where(Bus_Stop.node_id.isnot(None)).limit(10))).all()
    for sid, name, nid in srows:
        print(f"#   bus_stop_id={sid!r:14} name={name!r}")


async def nodes_and_routes(session):
    header("NODES (node_id for get_node; coords for nearest_node)")
    nrows = (await session.execute(
        select(Map_Node.node_id, Map_Node.name, Map_Node.floor,
               Map_Node.latitude, Map_Node.longitude).limit(10))).all()
    for nid, name, floor, lat, lon in nrows:
        print(f"#   node_id={nid!r:28} floor={floor} ({lat:.6f},{lon:.6f}) {name!r}")
    if nrows:
        nid, _, floor, lat, lon = nrows[0]
        print(f"\nnearest_node = [")
        print(f"    NearestCase(lat={lat!r}, lon={lon!r}, floor={floor!r}, expected_status=200),")
        print(f"]")
        print(f"#   (expect this to return node {nid!r} or one very close)")

    # ---- routing pairs via BFS on the real graph ----
    header("ROUTE PAIRS (fastest-reachable, and fastest-only/accessible-unreachable)")
    edges = (await session.execute(select(Map_Edge))).scalars().all()
    full_adj, acc_adj = {}, {}
    for e in edges:
        full_adj.setdefault(e.from_node_id, []).append(e.to_node_id)
        if e.is_accessible is not False:          # mirror A*'s accessible filter exactly
            acc_adj.setdefault(e.from_node_id, []).append(e.to_node_id)

    def bfs(adj, src):
        seen, dq = {src: 0}, deque([src])
        while dq:
            u = dq.popleft()
            for v in adj.get(u, []):
                if v not in seen:
                    seen[v] = seen[u] + 1
                    dq.append(v)
        return seen

    # pick a seed with the most outgoing edges (well-connected start)
    if not full_adj:
        print("#   no edges in graph — cannot derive route pairs")
        return
    seed = max(full_adj, key=lambda n: len(full_adj[n]))
    full_reach = bfs(full_adj, seed)
    acc_reach = bfs(acc_adj, seed)

    # a non-trivial fastest-reachable dest (a few hops away)
    far = sorted(((d, n) for n, d in full_reach.items() if d >= 2), reverse=True)
    fastest_dest = far[0][1] if far else None

    # a dest reachable in full but NOT in the accessible subgraph
    fastest_only = next((n for n in full_reach if n not in acc_reach and n != seed), None)
    # a dest reachable in BOTH (valid accessible pair)
    acc_dest = next((n for n in acc_reach if n != seed and acc_reach[n] >= 1), None)

    print(f"\nroutes = [")
    if fastest_dest:
        print(f"    RouteCase(start_id={seed!r}, destination_id={fastest_dest!r}, mode='fastest'),")
    if acc_dest:
        print(f"    RouteCase(start_id={seed!r}, destination_id={acc_dest!r}, mode='accessible'),")
    if fastest_only:
        print(f"    RouteCase(start_id={seed!r}, destination_id={fastest_only!r}, mode='accessible'),"
              f"  # expect 404: reachable in fastest, not in accessible subgraph")
    else:
        print(f"    # (no fastest-only pair found from this seed — graph may be fully accessible)")
    print(f"]")


async def main():
    async with AsyncSessionLocal() as session:
        await locations(session)
        await buildings_and_floors(session)
        await buses(session)
        await nodes_and_routes(session)
    print("\n# Paste the generated blocks into test_input.py and fill any remaining REPLACE_ME.")


if __name__ == "__main__":
    asyncio.run(main())
