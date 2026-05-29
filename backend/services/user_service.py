from uuid import uuid4
from repositories import user_repository
from schemas.user import UserCreate, UserDetail, UserUpdate
from models.users import User


async def get_user_detail(session, user_id):
    user: User = await user_repository.get_user_detail(session, user_id)

    if user is None:
        return None

    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        language=user.language,
        profile_settings=user.profile_settings,
    )

async def create_user(session, username, language, profile_settings):
    user_id = str(uuid4())
    user: User = await user_repository.create_user(session, user_id, username, language, profile_settings)

    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        language=user.language,
        profile_settings=user.profile_settings,
    )

async def update_user(session, user_id, username=None, language=None, profile_settings=None):
    user: User = await user_repository.update_user(session, user_id, username, language, profile_settings)

    if user is None:
        return None

    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        language=user.language,
        profile_settings=user.profile_settings,
    )

async def delete_user(session, user_id):
    boolean = await user_repository.delete_user(session, user_id)

    return boolean
