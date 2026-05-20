from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Routes@NUS Backend",
    version="0.1.0"
)

# some settings for local deving, to be edited before deploying
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# @app.on_event("startup")
# async def startup():
#     await connect_to_db()


# @app.on_event("shutdown")
# async def shutdown():
#     await close_db_connection()

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Routes@NUS Backend"
    }