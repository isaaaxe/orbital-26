from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.users import User

async def get_user_by_username(session, username):
    statement = select(User).where(User.username == username)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def get_user_detail(session, username, hashed_password):
    statement = select(User).where(
            User.username == username,
            User.hashed_password == hashed_password,
        )

    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    return user

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
async def update_user(session, username, hashed_password, new_username, new_hashed_password, language, profile_settings):
    user: User = await get_user_detail(session, username, hashed_password)

    if user is None:
        return None
    
    if new_username is not None:
        exisiting_user = await get_user_by_username(session, new_username)
        
        #TODO: make a exception class for this
        if exisiting_user is not None:
            return "username_taken"
        
        user.username = new_username

    if new_hashed_password is not None:
        user.hashed_password = new_hashed_password
    
    if language is not None:
        user.language = language
    
    if profile_settings is not None:
        user.profile_settings = profile_settings

    await session.commit()
    await session.refresh(user)

    return user

async def delete_user(session, username, hashed_password):
    user = await get_user_detail(session, username, hashed_password)

    if user is None:
        return False
    
    await session.delete(user)
    await session.commit()

    return True

