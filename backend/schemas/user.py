from pydantic import BaseModel

class UserDetail(BaseModel):
    user_id: str
    username: str 
    language: str = "en"
    profile_settings: list[str] = []

class UserCreate(BaseModel):
    username: str
    language: str = "en"
    profile_settings: list[str] = []

class UserUpdate(BaseModel):
    username: str | None = None
    language: str | None = None
    profile_settings: list[str] | None = None

