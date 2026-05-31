from uuid import uuid4
from repositories import user_repository
from schemas.user import UserCreate, UserDetail, UserUpdate
from models.users import User
import hashlib


def sha256_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

async def get_user_detail(session, username, password):
    hashed_password = sha256_hash(password)
    user: User = await user_repository.get_user_detail(session, username, hashed_password)

    if user is None:
        return None

    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        language=user.language,
        profile_settings=user.profile_settings,
    )


async def create_user(session, username, password, language, profile_settings):
    existing_user = await user_repository.get_user_by_username(session, username)

    if existing_user is not None:
        return None
    
    user_id = str(uuid4())
    hashed_password = sha256_hash(password)
    created_user: User = await user_repository.create_user(session, user_id, username, hashed_password, language, profile_settings)

    return UserDetail(
        user_id=created_user.user_id,
        username=created_user.username,
        language=created_user.language,
        profile_settings=created_user.profile_settings,
    )

async def update_user(session, username, password, new_username=None, new_password=None, language=None, profile_settings=None):
    hashed_password = sha256_hash(password)

    if new_password is not None:
        hashed_new_password = sha256_hash(new_password)
    else:
        hashed_new_password = None
    user: User = await user_repository.update_user(session, username, hashed_password, new_username, hashed_new_password, language, profile_settings)

    if user is None:
        return None
    
    #TODO: make a exception class for this
    if user == "username_taken":
        return "username_taken"

    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        language=user.language,
        profile_settings=user.profile_settings,
    )

async def delete_user(session, username, password):
    hashed_password = sha256_hash(password)
    boolean = await user_repository.delete_user(session, username, hashed_password)

    return boolean
