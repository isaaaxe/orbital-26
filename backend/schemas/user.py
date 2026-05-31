from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

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
    username: str 
    password: str
    new_username: str | None = None
    new_password: str | None = None
    language: str | None = None
    profile_settings: list[str] | None = None

