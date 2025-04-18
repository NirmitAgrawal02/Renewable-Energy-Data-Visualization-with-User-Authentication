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

class EnergyDataFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    energy_source: Optional[str] = None
    type: Optional[str] = None
