from fastapi import APIRouter
from schemas import user

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/{user_id}", response_model=user.UserDetail)
def get_user(user_id: str):
    return {}

@router.post("", response_model=user.UserDetail)
def add_user(request: user.UserCreate):
    return {}

@router.patch("/{user_id}", response_model=user.UserDetail)
def update_user(request: user.UserUpdate):
    #loop here for user
    return {}

@router.delete("/{user_id}")
def delete_user(user_id: str):
    return {
        "deleted": True,        
    }