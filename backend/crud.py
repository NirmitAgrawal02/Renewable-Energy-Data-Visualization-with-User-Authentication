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

def create_energy_data(db: Session, energy_data: schemas.EnergyDataCreate, user_id: int):
    date_obj = datetime.strptime(energy_data.date, "%Y-%m-%d").date()
    db_energy_data = models.EnergyData(user_id=user_id, date=date_obj, source=energy_data.source, amount=energy_data.amount)
    db.add(db_energy_data)
    db.commit()
    db.refresh(db_energy_data)

def get_filtered_energy_data(db: Session, filters: schemas.EnergyDataFilter):
    start_date = datetime.strptime(filters.start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(filters.end_date, "%Y-%m-%d").date()
    query = db.query(models.EnergyData).filter(models.EnergyData.date >= start_date, models.EnergyData.date <= end_date)
    if filters.source:
        query = query.filter(models.EnergyData.source == filters.source)
    return query.all()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta if expires_delta else datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
