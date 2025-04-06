from pydantic import BaseModel
from datetime import date
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class EnergyDataCreate(BaseModel):
    date: str  # Date in "YYYY-MM-DD"
    source: str
    amount: float

class EnergyDataFilter(BaseModel):
    start_date: str
    end_date: str
    source: Optional[str] = None  # Optional filter for energy source
