from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession


from schemas import auth
from services import auth_service
from core import database

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/login", response_model=auth.TokenResponse)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],  session: AsyncSession = Depends(database.get_db_session)):
    user = await auth_service.authenticate_user(session, form_data.username, form_data.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_user_token(user.user_id,)

    return auth.TokenResponse(access_token=access_token, token_type="bearer")
