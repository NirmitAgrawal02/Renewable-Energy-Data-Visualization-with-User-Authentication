from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from . import models, schemas, crud, dependencies, config
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = dependencies.SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

@app.get("/energy_data")
def get_all_energy_data(db: Session = Depends(get_db)):
    energy_data = crud.get_all_energy_data(db)
    return {"data": energy_data}

@app.get("/energy_data/filter")
def get_filtered_energy_data(start_date: str = None, end_date: str = None, source: str = None, db: Session = Depends(get_db)):
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "source": source
    }

    energy_data = crud.get_filtered_energy_data(db, filters)
    return {"data": energy_data}