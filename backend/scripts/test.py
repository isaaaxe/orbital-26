import asyncio
import httpx
from uuid import uuid4
from contextlib import contextmanager
import networkx as nx
from sqlalchemy import select, func, delete
from core.database import AsyncSessionLocal
from models.locations import Location
from models.bus_stops import Bus_Stop
from models.buses import Bus
from models.map_nodes import Map_Node
from models.buildings import Building
from models.floors import Floor
from models .users import User
from models.saved_locations import Saved_Location
from models.recent_locations import Recent_Location
from models.map_edges import Map_Edge
from models.map_nodes import Map_Node
from services.auth_service import verify_password
import test_input


base_url = "https://orbital-26.onrender.com"
SUPABASE_FLOORS = "https://dngynyaooicsuxbqnfth.supabase.co/storage/v1/object/public/floors"
TEST_PREFIX = "__test__"
HEURISTIC_SPEED = 8  # m/s, from astar.fastest_speed_m_per_second

@contextmanager
def guard(label):
    try:
        yield
    except Exception as e:
        print(f"{label}: EXCEPTION {type(e).__name__}: {e}")


async def test_health_endpoint():
    async with httpx.AsyncClient(base_url=base_url, timeout=60) as client:
        r = await client.get("/health")
        if r.status_code != 200:
            print(f"health: status {r.status_code}, expected 200")
        elif r.json() != {"status": "ok"}:
            print(f"health: body {r.json()}, expected {{'status': 'ok'}}")

async def test_location_endpoints():
    async with httpx.AsyncClient(base_url=base_url) as client, AsyncSessionLocal() as session:
        #test locations /search endpoint
        for case in test_input.search_locations:
            with guard(f"test '{case.query}'"):
                r = await client.get("/locations/search", params={"q": case.query})

                if r.status_code != case.expected_status:
                    print(f"{case.query}: status {r.status_code}, expected {case.expected_status}")
                    continue

                body = r.json()                     
                got_ids = {row["id"] for row in body}

                if got_ids != case.expected_ids:    
                    print(f"{case.query}: ids {got_ids}, expected {case.expected_ids}")

                for row in body:
                    result = await session.execute(select(Location).where(Location.id == row["id"]))
                    db_row = result.scalar_one_or_none()
                    if db_row is None:
                        print(f"{case.query}: returned id {row['id']} not in DB")
                    elif row["name"] != db_row.name:
                        print(f"{case.query}: name mismatch for {row['id']}")

        #test locations /get location
        for case in test_input.get_location:
            with guard(f"test '{case.location_id}'"):
                r = await client.get(f"/locations/{case.location_id}")

                if r.status_code != case.expected_status:
                    print(f"{case.location_id}: status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:       
                    continue

                body = r.json()                 
                if body["id"] != case.location_id:
                    print(f"{case.location_id}: returned wrong id {body['id']}")

                result = await session.execute(select(Location).where(Location.id == body["id"]))
                db_row = result.scalar_one_or_none()
                if db_row is None:
                    print(f"{case.location_id}: returned id not in DB")
                elif body["name"] != db_row.name:
                    print(f"{case.location_id}: name mismatch")
        
        #test get_location_by_type
        for case in test_input.get_location_by_type:
            with guard(f"test '{case.location_type}'"):
                r = await client.get("/locations", params={"location_type": case.location_type})

                if r.status_code != case.expected_status:
                    print(f"{case.location_type}: status {r.status_code}, expected {case.expected_status}")
                    continue

                body = r.json()                     
                got_ids = {row["id"] for row in body}

                if got_ids != case.expected_ids:     
                    print(f"{case.location_type}: ids {got_ids}, expected {case.expected_ids}")

                for row in body:
                    result = await session.execute(select(Location).where(Location.id == row["id"]))
                    db_row = result.scalar_one_or_none()
                    if db_row is None:
                        print(f"{case.location_type}: returned id {row['id']} not in DB")
                    elif row["name"] != db_row.name:
                        print(f"{case.location_type}: name mismatch for {row['id']}")


async def test_bus_endpoints():
    async with httpx.AsyncClient(base_url=base_url, timeout=60) as client, AsyncSessionLocal() as session:
        #test get_bus
        for case in test_input.get_bus:
            with guard(f"test '{case.bus_number}'"):
                r = await client.get("/bus-service/bus", params={"bus_number": case.bus_number})
                if r.status_code != case.expected_status:
                    print(f"{case.bus_number}: status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:
                    continue
                body = r.json()
                # echo check + DB existence (assumes BusResponse exposes bus_number)
                if body["bus_number"] != case.bus_number:
                    print(f"{case.bus_number}: returned wrong bus_number {body['bus_number']}")
                result = await session.execute(select(Bus).where(Bus.bus_number == case.bus_number))
                if result.scalar_one_or_none() is None:
                    print(f"{case.bus_number}: returned a bus not in DB")

        # test get bus by id
        for case in test_input.get_bus_stop_by_id:
            with guard(f"test '{case.bus_stop_id}'"):
                r = await client.get(f"/bus-service/bus_stop/id/{case.bus_stop_id}")
                if r.status_code != case.expected_status:
                    print(f"{case.bus_stop_id}: status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:
                    continue
                body = r.json()
                result = await session.execute(
                    select(Bus_Stop).where(Bus_Stop.bus_stop_id == case.bus_stop_id))
                db_row = result.scalar_one_or_none()
                if db_row is None:
                    print(f"{case.bus_stop_id}: returned a stop not in DB")
                elif body["name"] != db_row.name:
                    print(f"{case.bus_stop_id}: name mismatch")

        # test get bus stop by name, check if query exists in bus stop name returned and id exists in db
        for case in test_input.get_bus_stop_by_name:
            with guard(f"test '{case.query}'"):
                r = await client.get(f"/bus-service/bus_stop/name/{case.query}")
                if r.status_code != case.expected_status:
                    print(f"{case.query}: status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:
                    continue
                body = r.json()

                if case.query.lower() not in body["name"].lower():
                    print(f"{case.query}: returned name '{body['name']}' doesn't contain query")
                result = await session.execute(
                    select(Bus_Stop).where(Bus_Stop.bus_stop_id == body["bus_stop_id"]))
                if result.scalar_one_or_none() is None:
                    print(f"{case.query}: returned stop id not in DB")

        #test get all bus stops 
        with guard(f"test all bus stops"):
            r = await client.get("/bus-service/bus_stop/all")
            if r.status_code != 200:
                print(f"bus_stop/all: status {r.status_code}, expected 200")
            else:
                got_ids = {row["bus_stop_id"] for row in r.json()}
                result = await session.execute(
                    select(Bus_Stop.bus_stop_id).where(Bus_Stop.node_id.isnot(None)))
                expected_ids = {row[0] for row in result.all()}
                if got_ids != expected_ids:
                    print(f"bus_stop/all: id-set mismatch, "
                        f"missing {expected_ids - got_ids}, extra {got_ids - expected_ids}")
                
def close(a, b, tol=1e-6):
    return abs(a - b) <= tol

async def test_campus_map_endpoints():
    async with httpx.AsyncClient(base_url=base_url, timeout=60) as client, AsyncSessionLocal() as session:
        # test get node by id 
        for case in test_input.get_node:
            with guard(f"test '{case.node_id}'"):
                r = await client.get(f"/campus-map/nodes/{case.node_id}")
                if r.status_code != case.expected_status:
                    print(f"{case.node_id}: status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:
                    continue
                body = r.json()
                db = (await session.execute(
                    select(Map_Node).where(Map_Node.node_id == case.node_id))).scalar_one_or_none()
                if db is None:
                    print(f"{case.node_id}: returned node not in DB")
                else:
                    for f in ("name", "node_type", "building_id", "floor"):
                        if body[f] != getattr(db, f):
                            print(f"{case.node_id}: {f} mismatch")
                    if not (close(body["latitude"], db.latitude) and close(body["longitude"], db.longitude)):
                        print(f"{case.node_id}: coordinate mismatch")

        # test get nearest node
        for case in test_input.nearest_node:
            with guard(f"test nearets node with '{case.lat}, {case.lon}, {case.floor}'"):
                r = await client.get("/campus-map/nodes/nearest",
                    params={"latitude": case.lat, "longitude": case.lon, "floor": case.floor})
                if r.status_code != case.expected_status:
                    print(f"nearest({case.lat},{case.lon}): status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:
                    continue
                body = r.json()
                if body["distance_to_nearest_node"] < 0:
                    print(f"nearest({case.lat},{case.lon}): negative distance")
                nid = body["nearest_node"]["node_id"]
                if (await session.execute(
                        select(Map_Node).where(Map_Node.node_id == nid))).scalar_one_or_none() is None:
                    print(f"nearest({case.lat},{case.lon}): node {nid} not in DB")

        #test search_buildings making sure all returned buildings exist in db 
        for case in test_input.search_buildings:
            with guard(f"test '{case.query}'"):
                r = await client.get("/campus-map/buildings", params={"building_name": case.query})
                if r.status_code != case.expected_status:
                    print(f"{case.query}: status {r.status_code}, expected {case.expected_status}")
                    continue
                body = r.json()
                got_ids = {b["building_id"] for b in body}
                if got_ids != case.expected_ids:
                    print(f"{case.query}: ids {got_ids}, expected {case.expected_ids}")

        # test get all buildings
        with guard(f"test all buildings"):
            r = await client.get("/campus-map/buildings/all")
            if r.status_code != 200:
                print(f"buildings/all: status {r.status_code}, expected 200 "
                    f"(404 here means /{{building_id}} is shadowing /all)")
            else:
                got_ids = {b["building_id"] for b in r.json()}
                db_ids = {row[0] for row in
                    (await session.execute(select(Building.building_id))).all()}
                if got_ids != db_ids:
                    print(f"buildings/all: id-set mismatch, "
                        f"missing {db_ids - got_ids}, extra {got_ids - db_ids}")

        # test get building by id 
        for case in test_input.get_building:
            with guard(f"test '{case.building_id}'"):
                r = await client.get(f"/campus-map/buildings/{case.building_id}")
                if r.status_code != case.expected_status:
                    print(f"{case.building_id}: status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:
                    continue
                body = r.json()
                db = (await session.execute(
                    select(Building).where(Building.building_id == case.building_id))).scalar_one_or_none()
                if db is None:
                    print(f"{case.building_id}: returned building not in DB")
                elif body["display_name"] != db.display_name or body["building_code"] != db.building_code:
                    print(f"{case.building_id}: display_name/building_code mismatch")

        # test get building floors by building id 
        for case in test_input.get_building_floors:
            with guard(f"test get all floors for building id: '{case.building_id}'"):
                r = await client.get(f"/campus-map/buildings/{case.building_id}/floors")
                if r.status_code != case.expected_status:
                    print(f"{case.building_id} floors: status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:
                    continue
                for floor in r.json():
                    if not floor["image_url"].startswith(SUPABASE_FLOORS):
                        print(f"{case.building_id} floor {floor['floor_number']}: "
                            f"image_url not a Supabase URL -> {floor['image_url']}")
                    if (await session.execute(select(Floor).where(
                            Floor.building_id == case.building_id,
                            Floor.floor_number == floor["floor_number"]))).scalar_one_or_none() is None:
                        print(f"{case.building_id} floor {floor['floor_number']}: not in DB")

        # test get floor by building id and floor number
        for case in test_input.get_floor:
            with guard(f"test get floor '{case.floor_number}' for building id: '{case.building_id}'"):
                r = await client.get(
                    f"/campus-map/buildings/{case.building_id}/floors/{case.floor_number}")
                if r.status_code != case.expected_status:
                    print(f"{case.building_id}/{case.floor_number}: status {r.status_code}, expected {case.expected_status}")
                    continue
                if r.status_code == 404:
                    continue
                body = r.json()
                db = (await session.execute(select(Floor).where(
                    Floor.building_id == case.building_id,
                    Floor.floor_number == case.floor_number))).scalar_one_or_none()
                if db is None:
                    print(f"{case.building_id}/{case.floor_number}: returned floor not in DB")
                else:
                    if body["floor_name"] != db.floor_name:
                        print(f"{case.building_id}/{case.floor_number}: floor_name mismatch")
                    if (body["image_width"], body["image_height"]) != (db.image_width, db.image_height):
                        print(f"{case.building_id}/{case.floor_number}: image dimensions mismatch")
                    if not body["image_url"].startswith(SUPABASE_FLOORS):
                        print(f"{case.building_id}/{case.floor_number}: image_url not Supabase -> {body['image_url']}")

def auth_header(token):
    return {"Authorization": f"Bearer {token}"}

async def test_auth_cycle():
    username = f"{TEST_PREFIX}{uuid4().hex[:8]}"
    pw = "123456789"
    async with httpx.AsyncClient(base_url=base_url, timeout=60) as client, AsyncSessionLocal() as session:
        try:
            #remove any leftovers from prev tests 
            await session.execute(delete(User).where(User.username.like(f"{TEST_PREFIX}%")))
            await session.commit()
        
            #create user
            r = await client.post("/users", json={"username": username, "password": pw, "language": "en", "profile_settings": []})

            if r.status_code != 200:
                print(f"create: status {r.status_code}, expected 200"); return
            user_id = r.json()["user_id"]

            db = (await session.execute(select(User).where(User.user_id == user_id))).scalar_one_or_none()
            if db is None:
                print("create: user not in DB")
            else:
                #check password
                if db.hashed_password == pw:
                    print("create: PLAINTEXT password stored")      
                if not db.hashed_password.startswith("$2b$"):
                    print("create: stored value is not a bcrypt hash")
                if not verify_password(pw, db.hashed_password):
                    print("create: hash does not verify against password")
            
            #check duplicate
            r = await client.post("/users", json={"username": username, "password": pw, "language": "en", "profile_settings": []})

            if r.status_code != 409:
                print(f"duplicate create: status {r.status_code}, expected 409")
            
            statement = await session.execute(select(User).where(User.username == username))
            dup = statement.scalars().all()

            if len(dup) != 1:
                print(f"duplicate create: {len(dup)} rows exist, expected 1")
            
            #login 
            r = await client.post("/auth/login", data={"username": username, "password": pw})
            if r.status_code != 200:
                print(f"login: status {r.status_code}, expected 200"); return
            tok = r.json()
            if tok.get("token_type") != "bearer" or "access_token" not in tok:
                print(f"login: malformed token response {tok}")
            token = tok["access_token"]

            # test get_user
            r = await client.get("/users/me", headers=auth_header(token))
            if r.status_code != 200 or r.json()["user_id"] != user_id:
                print(f"/me: got {r.status_code} / {r.json()}, expected user_id {user_id}")

            #test update user
            new_username = f"{TEST_PREFIX}{uuid4().hex[:8]}"
            r = await client.patch("/users/update", headers=auth_header(token),
                                json={"new_username": new_username})
            if r.status_code != 200 or r.json()["username"] != new_username:
                print(f"update username: got {r.status_code} / {r.json()}")
            await session.commit() 
            db = (await session.execute(select(User).where(User.user_id == user_id))).scalar_one_or_none()
            if db is None or db.username != new_username:
                print("update: DB username not changed")
            
            new_pw = "987654321"
            old_hash = db.hashed_password
            r = await client.patch("/users/update", headers=auth_header(token),
                                json={"new_password": new_pw})
            if r.status_code != 200:
                print(f"update password: got {r.status_code}")
            await session.commit() 
            db = (await session.execute(select(User).where(User.user_id == user_id))).scalar_one_or_none()
            if db is None:
                print("update password: user not in DB")
            elif not verify_password(new_pw, db.hashed_password):
                print("update: DB password not changed")
            if db.hashed_password == old_hash:
                print("update password: hash unchanged")

            #relogin to test if new pw and username can be used
            r_old = await client.post("/auth/login", data={"username": new_username, "password": pw})
            if r_old.status_code != 401:
                print(f"update password: old password still logs in ({r_old.status_code})")
            r_new = await client.post("/auth/login", data={"username": new_username, "password": new_pw})
            if r_new.status_code != 200:
                print(f"update password: new password fails to log in ({r_new.status_code})")

            #test delete user
            r = await client.delete("/users", headers=auth_header(token))
            if r.status_code != 200 or r.json().get("deleted") is not True:
                print(f"delete: got {r.status_code} / {r.json()}")
            await session.commit()
            if (await session.execute(
                    select(User).where(User.user_id == user_id))).scalar_one_or_none() is not None:
                print("delete: user still in DB")
        except Exception as e:
            print(f"auth cycle: EXCEPTION {type(e).__name__}: {e}")
        finally:
            #remove all test users
            await session.execute(delete(User).where(User.username.like(f"{TEST_PREFIX}%")))
            await session.commit()

async def make_test_user(client, session):
    uname = f"{TEST_PREFIX}{uuid4().hex[:8]}"
    r = await client.post("/users", json={"username": uname, "password": "pw",
                                          "language": "en", "profile_settings": []})
    if r.status_code != 200:
        print(f"setup: create failed {r.status_code}"); return None, None
    user_id = r.json()["user_id"]
    r = await client.post("/auth/login", data={"username": uname, "password": "pw"})
    if r.status_code != 200:
        print(f"setup: login failed {r.status_code}"); return user_id, None
    return user_id, r.json()["access_token"]

async def cleanup_test_users(session):
    ids = (await session.execute(
        select(User.user_id).where(User.username.like(f"{TEST_PREFIX}%")))).scalars().all()
    if ids:
        await session.execute(delete(Recent_Location).where(Recent_Location.user_id.in_(ids)))
        await session.execute(delete(Saved_Location).where(Saved_Location.user_id.in_(ids)))
        await session.execute(delete(User).where(User.user_id.in_(ids)))
        await session.commit()


async def test_saves_cycle():
    async with httpx.AsyncClient(base_url=base_url, timeout=60) as client, AsyncSessionLocal() as session:
        try:
            await cleanup_test_users(session)
            user_id, token = await make_test_user(client, session)
            if token is None:
                return
            header = auth_header(token)
            real_loc = test_input.save_valid_location      
            fake_loc = test_input.save_invalid_location    

            #test save a location
            with guard("save: create"):
                r = await client.post("/users/me/saves", headers=header,
                                      json={"location_id": real_loc, "purpose": "home"})
                if r.status_code != 200:
                    print(f"save create: status {r.status_code}, expected 200")
                else:
                    body = r.json()
                    save_id = body["save_id"]
                    if body["purpose"] != "home":
                        print(f"save create: purpose {body['purpose']}, expected 'home'")
                    await session.commit()
                    db = (await session.execute(select(Saved_Location).where(
                        Saved_Location.id == save_id))).scalar_one_or_none()
                    if db is None:
                        print("save create: row not in DB")
                    elif db.user_id != user_id or db.location_id != real_loc:
                        print("save create: DB row scoped to wrong user/location")

            #test dup save location
            with guard("save: duplicate"):
                r2 = await client.post("/users/me/saves", headers=header,
                                       json={"location_id": real_loc, "purpose": "home"})
                if r2.status_code != 200 or r2.json()["save_id"] != save_id:
                    print(f"save idempotent: got {r2.status_code} / {r2.json()}, expected save_id {save_id}")
                await session.commit()
                rows = (await session.execute(select(Saved_Location).where(
                    Saved_Location.user_id == user_id,
                    Saved_Location.location_id == real_loc))).scalars().all()
                if len(rows) != 1:
                    print(f"save dup: {len(rows)} rows, expected 1")
            
            #test save fake location
            with guard("save: invalid location"):
                r = await client.post("/users/me/saves", headers=header, json={"location_id": fake_loc})
                if r.status_code != 404:
                    print(f"save invalid: status {r.status_code}, expected 404")

            #test if saved location exists for user
            with guard("save: save exists for user"):
                r = await client.get("/users/me/saves", headers=header)
                if r.status_code != 200:
                    print(f"save list: status {r.status_code}")
                elif real_loc not in {s["location_id"] for s in r.json()}:
                    print("save list: created save missing")
            
            #test delete
            with guard("save: delete"):
                r = await client.delete(f"/users/me/saves/{real_loc}", headers=header)
                if r.json().get("deleted") is not True:
                    print(f"save delete: {r.json()}, expected deleted true")
                await session.commit()
                if (await session.execute(select(Saved_Location).where(
                        Saved_Location.id == save_id))).scalar_one_or_none() is not None:
                    print("save delete: row still in DB")

            #test delete non existent saved location
            with guard("save: delete-noop"):
                r = await client.delete(f"/users/me/saves/{real_loc}", headers=header)
                if r.json().get("deleted") is not False:
                    print(f"save delete-noop: {r.json()}, expected deleted false")
        except Exception as e:
            print(f"saves cycle: EXCEPTION {type(e).__name__}: {e}")
        finally:
            await cleanup_test_users(session)

async def test_recent_cycle():
    async with httpx.AsyncClient(base_url=base_url, timeout=60) as client, AsyncSessionLocal() as session:
        try:
            await cleanup_test_users(session)
            user_id, token = await make_test_user(client, session)
            if token is None:
                return
            header = auth_header(token)
            loc1 = test_input.recent_location_a   
            loc2 = test_input.recent_location_b
            fake_loc = test_input.save_invalid_location

            # test add recent location, loc1 -> loc2 -> loc1, order from oldest: loc2, loc1
            with guard("recent: upsert"):
                ra = await client.post("/users/me/recent_locations", headers=header, json={"location_id": loc1})
                recent_id_a = ra.json()["recent_id"]
                await client.post("/users/me/recent_locations", headers=header, json={"location_id": loc2})
                ra2 = await client.post("/users/me/recent_locations", headers=h, json={"location_id": a})
                if ra2.json()["recent_id"] != recent_id_a:
                    print(f"recent upsert: a got new recent_id {ra2.json()['recent_id']}, expected {recent_id_a}")
                await session.commit()
                rows = (await session.execute(select(Recent_Location).where(
                    Recent_Location.user_id == user_id))).scalars().all()
                if len(rows) != 2:
                    print(f"recent upsert: {len(rows)} rows, expected 2 (a should not duplicate)")

            #get recent locations limit 5
            with guard("recent: order"):
                r = await client.get("/users/me/recent_locations", headers=header)
                items = r.json()
                if len(items) > 5:
                    print(f"recent order: {len(items)} items, expected <= 5")
                if not items or items[0]["location_id"] != loc1:
                    print(f"recent order: first is {items[0]['location_id'] if items else None}, expected {loc1}")

            #add invalid location
            with guard("recent: invalid"):
                r = await client.post("/users/me/recent_locations", headers=header, json={"location_id": fake_loc})
                if r.status_code != 404:
                    print(f"recent invalid: status {r.status_code}, expected 404")

            # delete one recent loc
            with guard("recent: delete one"):
                r = await client.request("DELETE", "/users/me/recent_locations/one",
                                         headers=header, json={"location_id": loc1})
                if r.json().get("deleted") is not True:
                    print(f"recent delete-one: {r.json()}, expected deleted true")
                await session.commit()
                still = (await session.execute(select(Recent_Location).where(
                    Recent_Location.user_id == user_id,
                    Recent_Location.location_id == loc1))).scalar_one_or_none()
                if still is not None:
                    print("recent delete-one: row still in DB")

            # delete all recent loc for user
            with guard("recent: delete all"):
                r = await client.delete("/users/me/recent_locations/all", headers=header)
                if r.json().get("deleted") is not True:
                    print(f"recent delete-all: {r.json()}, expected deleted true")
                await session.commit()
                rows = (await session.execute(select(Recent_Location).where(
                    Recent_Location.user_id == user_id))).scalars().all()
                if rows:
                    print(f"recent delete-all: {len(rows)} rows remain")

            #delete all again will return false
            with guard("recent: delete all noop"):
                r = await client.delete("/users/me/recent_locations/all", headers=header)
                if r.json().get("deleted") is not False:
                    print(f"recent delete-all-noop: {r.json()}, expected deleted false")
        except Exception as e:
            print(f"recent cycle: EXCEPTION {type(e).__name__}: {e}")
        finally:
            await cleanup_test_users(session)

def seconds_close(a, b, tol=1e-3):
    return abs(a - b) <= tol

async def build_nx_graph(session, mode):
    edges = (await session.execute(select(Map_Edge))).scalars().all()
    nxGraph = nx.DiGraph()
    for e in edges:
        if mode == "accessible" and e.is_accessible == False:   # mirror A* exactly (None stays in)
            continue
        # fastest: no filter, all edges
        nxGraph.add_edge(e.from_node_id, e.to_node_id, seconds=e.estimated_seconds)
    return nxGraph

async def assert_accessible_path(session, route):
    edge_acc = {(e.from_node_id, e.to_node_id): e.is_accessible
                for e in (await session.execute(select(Map_Edge))).scalars().all()}
    for s in route["steps"]:
        key = (s["from_node_id"], s["to_node_id"])
        if key not in edge_acc:
            print(f"  PHANTOM EDGE: step {s['step_number']} {key} not a real edge")
        elif edge_acc[key] is False:
            print(f"  ACCESSIBLE VIOLATION: step {s['step_number']} traverses inaccessible edge")


async def test_route_optimality():
    async with httpx.AsyncClient(base_url=base_url, timeout=60) as client, AsyncSessionLocal() as session:
        for case in test_input.routes: 
            with guard(f"route {case.start_id}->{case.destination_id} [{case.mode}]"):
                r = await client.post("/routes", json={
                    "start_id": case.start_id,
                    "destination_id": case.destination_id,
                    "mode": [case.mode],
                })
                nxGraph = await build_nx_graph(session, case.mode)

                try:
                    nx_cost = nx.dijkstra_path_length(nxGraph, case.start_id, case.destination_id, weight="seconds")
                    nx_has_path = True
                except (nx.NetworkXNoPath, nx.NodeNotFound):
                    nx_has_path = False

                #test if route exists
                if not nx_has_path:
                    if r.status_code != 404:
                        print(f"  nx: no path, but endpoint returned {r.status_code} (expected 404)")
                    continue
                if r.status_code != 200:
                    print(f"  endpoint {r.status_code}, but a path exists (expected 200)")
                    continue

                route = r.json()[0] 
                dur = route["total_estimated_seconds"]

                #compare time diff
                if dur > nx_cost + 1e-3:
                    print(f"  SUBOPTIMAL: route {dur:.3f}s > optimum {nx_cost:.3f}s "
                          f"(heuristic likely inadmissible — edge faster than {HEURISTIC_SPEED} m/s on this route)")
                elif dur < nx_cost - 1e-3:
                    print(f"  INCONSISTENT: route {dur:.3f}s < nx optimum {nx_cost:.3f}s "
                          f"(oracle graph diverged from A*'s — check filter/weight)")

                #check for route steps time and distance consistency to total time and dist
                if not seconds_close(sum(s["estimated_seconds"] for s in route["steps"]), dur):
                    print(f"  step seconds don't sum to total_estimated_seconds")
                if not seconds_close(sum(s["distance_for_step"] for s in route["steps"]), route["total_distance"]):
                    print(f"  step distances don't sum to total_distance")

                #check if all nodes and edges are connected 
                steps = route["steps"]
                if steps:
                    if steps[0]["from_node_id"] != case.start_id:
                        print(f"  path doesn't start at {case.start_id}")
                    if steps[-1]["to_node_id"] != case.destination_id:
                        print(f"  path doesn't end at {case.destination_id}")
                    for i in range(len(steps) - 1):
                        if steps[i]["to_node_id"] != steps[i+1]["from_node_id"]:
                            print(f"  broken chain between step {i+1} and {i+2}")

                #mode-specific
                if case.mode == "accessible":
                    await assert_accessible_path(session, route)

async def main():
    suites = [
        ("locations", test_location_endpoints),
        ("buses", test_bus_endpoints),
        ("campus_map", test_campus_map_endpoints),
        ("health", test_health_endpoint),
        ("auth", test_auth_cycle),
        ("saved_locations", test_saves_cycle),
        ("recent_locations", test_recent_cycle),
        ("route_optimality", test_route_optimality)
    ]
    for name, fn in suites:
        try:
            await fn()
        except Exception as e:
            print(f"[{name}] suite aborted: {type(e).__name__}: {e}")

asyncio.run(main())

