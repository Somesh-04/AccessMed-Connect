# backend/db/session.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.config import settings # since config.py is inside backend folder

# Build Database URL from .env values
DATABASE_URL = (
    f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@"
    f"{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/"
    f"{settings.POSTGRES_DB}"
)

# Create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    future=True,
    echo=True  # shows SQL logs; good for debugging
)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
