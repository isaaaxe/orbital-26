from uuid import uuid4
from repositories import user_repository
from schemas.user import UserCreate, UserDetail, UserUpdate
from models.users import User
from services import auth_service


async def get_user_detail(session, current_user: User):
    user: User = await user_repository.get_user_by_id(session, current_user.user_id)

    if user is None:
        return None

    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        language=user.language,
        pace_factor=user.pace_factor,
        shelter_pref=user.shelter_pref
    )


async def create_user(session, username, password, language, pace_factor, shelter_pref):
    existing_user = await user_repository.get_user_by_username(session, username)

    if existing_user is not None:
        return None
    
    user_id = str(uuid4())
    hashed_password = auth_service.hash_password(password)
    created_user: User = await user_repository.create_user(session, user_id, username, hashed_password, language, pace_factor, shelter_pref)

    return UserDetail(
        user_id=created_user.user_id,
        username=created_user.username,
        language=created_user.language,
        pace_factor=created_user.pace_factor,
        shelter_pref=created_user.shelter_pref
    )

async def update_user(session, current_user, new_username=None, new_password=None, language=None, pace_factor=None, shelter_pref=None):
    if new_password is not None:
        hashed_new_password = auth_service.hash_password(new_password)
    else:
        hashed_new_password = None
    user: User = await user_repository.update_user(session, current_user, new_username, hashed_new_password, language, pace_factor, shelter_pref)

    if user is None:
        return None
    
    #TODO: make a exception class for this
    if user == "username_taken":
        return "username_taken"

    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        language=user.language,
        pace_factor=user.pace_factor,
        shelter_pref=user.shelter_pref
    )

async def delete_user(session, current_user):
    boolean = await user_repository.delete_user(session, current_user)

    return boolean
