from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.users import User

async def get_user_by_username(session, username):
    statement = select(User).where(User.username == username)
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_user_by_id(session, user_id):
    statement = select(User).where(User.user_id == user_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def create_user(session, user_id, username, hashed_password, language, profile_settings):
    user = User(
        user_id=user_id,
        username=username,
        hashed_password=hashed_password,
        language=language,
        profile_settings=profile_settings,
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return user

#add change password feature in the future
async def update_user(session, current_user, new_username, new_hashed_password, language, profile_settings):
    if new_username is not None:
        existing_user = await get_user_by_username(session, new_username)
        
        #TODO: make a exception class for this
        if existing_user is not None and existing_user.user_id != current_user.user_id:
            return "username_taken"
        
        current_user.username = new_username

    if new_hashed_password is not None:
        current_user.hashed_password = new_hashed_password
    
    if language is not None:
        current_user.language = language
    
    if profile_settings is not None:
        current_user.profile_settings = profile_settings

    await session.commit()
    await session.refresh(current_user)

    return current_user

async def delete_user(session, current_user):
    user = await get_user_by_id(session, current_user.user_id)

    if user is None:
        return False
    
    await session.delete(user)
    await session.commit()

    return True

