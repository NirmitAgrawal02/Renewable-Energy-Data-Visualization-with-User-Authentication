from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from jose import JWTError, jwt
from . import models, schemas, crud, dependencies, config
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

# FastAPI app
app = FastAPI()

# Configure CORS middleware
origins = [
    "http://localhost:3000",  # Your frontend URL (React running locally)
    "http://127.0.0.1:3000", # You can add more origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from these origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Dependency for database session
def get_db():
    db = dependencies.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Security settings
SECRET_KEY = config.SECRET_KEY
ALGORITHM = config.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = config.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    crud.create_user(db, user)
    return {"message": "User created successfully"}

@app.post("/login", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user(db, email=request.email)
    if not user or not crud.verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = crud.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/energy_data")
def create_energy_data(energy_data: schemas.EnergyDataCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email: str = payload.get("sub")
    user = crud.get_user(db, email=email)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    crud.create_energy_data(db, energy_data, user.id)
    return {"message": "Energy data added successfully"}

@app.post("/energy_data/filter")
def get_filtered_energy_data(filters: schemas.EnergyDataFilter, db: Session = Depends(get_db)):
    energy_data = crud.get_filtered_energy_data(db, filters)
    return {"data": energy_data}
