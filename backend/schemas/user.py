from pydantic import BaseModel

class UserDetail(BaseModel):
    user_id: str
    username: str 
    language: str = "en"
    profile_settings: list[str] = []

class UserCreate(BaseModel):
    username: str
    password: str
    language: str = "en"
    profile_settings: list[str] = []

#changing password in future
class UserUpdate(BaseModel):
    new_username: str | None = None
    new_password: str | None = None
    language: str | None = None
    profile_settings: list[str] | None = None

