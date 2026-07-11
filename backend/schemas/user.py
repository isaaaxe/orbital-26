from pydantic import BaseModel

class UserDetail(BaseModel):
    user_id: str
    username: str 
    language: str = "en"
    pace_factor: float = 1.0
    shelter_pref: float = 0.7

class UserCreate(BaseModel):
    username: str
    password: str
    language: str = "en"
    pace_factor: float = 1.0
    shelter_pref: float = 0.7

#changing password in future
class UserUpdate(BaseModel):
    new_username: str | None = None
    new_password: str | None = None
    language: str | None = None
    pace_factor: float | None = None
    shelter_pref: float | None = None

