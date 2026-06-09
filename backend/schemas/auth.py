from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class CurrentUserResponse(BaseModel):
    user_id: str
    username: str

    