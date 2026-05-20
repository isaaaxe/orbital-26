import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

db_pool = None


async def connect_to_db():
    global db_pool

    if not DATABASE_URL:
        print("DATABASE_URL not found. Running without database.")
        return

    db_pool = await asyncpg.create_pool(DATABASE_URL)
    print("Connected to Postgres")


async def close_db_connection():
    global db_pool

    if db_pool:
        await db_pool.close()
        print("Closed Postgres connection")


def get_db_pool():
    return db_pool