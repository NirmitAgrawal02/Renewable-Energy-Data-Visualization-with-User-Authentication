from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./renewable.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class EnergyData(Base):
    __tablename__ = "energy_data"
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, index=True)  # Store date as string (TEXT)
    hour_beginning = Column(String, index=True)  # For the "Hour Beginning" column
    hour_ending = Column(String)  # For the "Hour Ending" column
    energy_source = Column(String)  # For the "Energy Source" column
    type = Column(String)  # For the "Type" column
    consumption_mwh = Column(Float)  # For the "Consumption (MWh)" column
    generation_mwh = Column(Float)  # For the "Generation (MWh)" column
    weather = Column(String)  # For the "Weather" column
    price_per_mwh = Column(Float)  # For the "Price ($/MWh)" column
    revenue = Column(Float)  # For the "Revenue ($)" column

Base.metadata.create_all(bind=engine)
