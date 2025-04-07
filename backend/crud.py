from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from . import models, schemas
import os

SECRET_KEY = os.getenv("SECRET_KEY", "a-very-secret-key-for-dev-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

def get_all_energy_data(db: Session):
    return db.query(models.EnergyData).all()

def get_filtered_energy_data(db: Session, filters: dict):
    # Access the filter values from the dictionary
    start_date = filters.get('start_date')
    end_date = filters.get('end_date')
    source = filters.get('source')

    # Apply filters based on the provided criteria
    query = db.query(models.EnergyData)

    if start_date:
        # Ensure that start_date is in the correct format (YYYY-MM-DD)
        query = query.filter(models.EnergyData.date >= start_date)

    if end_date:
        # Ensure that end_date is in the correct format (YYYY-MM-DD)
        query = query.filter(models.EnergyData.date <= end_date)

    if source:
        query = query.filter(models.EnergyData.energy_source == source)

    energy_data = query.all()
    return energy_data
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta if expires_delta else datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)