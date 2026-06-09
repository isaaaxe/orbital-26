from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import settings
from core import database

from repositories import user_repository 
from models.users import User

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

def verify_password(password, hashed_password) -> bool:
    return pwd_context.verify(password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)


async def authenticate_user(session, username, password):
    user: User = await user_repository.get_user_by_username(session, username)

    if user is None:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None

    return user

def create_user_token(user_id: str, expires_delta: timedelta | None = None):
    to_encode = {
        "sub": user_id,
    }

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(session: AsyncSession = Depends(database.get_db_session), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await user_repository.get_user_by_id(session, user_id)
    
    if user is None:
        raise credentials_exception

    return user
    