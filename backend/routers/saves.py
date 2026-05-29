from fastapi import APIRouter
from schemas import save

router=APIRouter(
    prefix="/users/{user_id}/saves",
    tags=["saves"]
)

@router.get("", response_model=list[save.SaveResponse])
def get_user_saves(user_id: str):
    return []

@router.post("", response_model=save.SaveResponse)
def add_user_save(user_id: str, request: save.AddSaveRequest):
    #search data base for fav and then add it ig
    return {}

@router.patch("/{save_id}")
def update_user_save(user_id: str, save_id: str):
    #search data base and update
    return {}

@router.delete("/{save_id}")
def delete_user_save(user_id: str, save_id: str):
    #same as add search and delete
    return {}

