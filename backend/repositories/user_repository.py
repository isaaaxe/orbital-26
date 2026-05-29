from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.users import User

async def get_user_detail(session, user_id):
    statement = select(User).where(User.user_id == user_id)

    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    return user

async def create_user(session, user_id, username, language, profile_settings):
    user = User(
        user_id=user_id,
        username=username,
        language=language,
        profile_settings=profile_settings,
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return user

async def update_user(session, user_id, username, language, profile_settings):
    user: User = await get_user_detail(session, user_id)

    if user is None:
        return None
    
    if username is not None:
        user.username = username
    
    if language is not None:
        user.language = language
    
    if profile_settings is not None:
        user.profile_settings = profile_settings

    await session.commit()
    await session.refresh(user)

    return user

async def delete_user(session, user_id):
    user = await get_user_detail(session, user_id)

    if user is None:
        return False
    
    await session.delete(user)
    await session.commit()

    return True

