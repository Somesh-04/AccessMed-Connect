from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")
        env_file_encoding = "utf-8"

settings = Settings()
