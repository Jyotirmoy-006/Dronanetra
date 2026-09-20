"""Core configuration and settings module."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    database_url: str = "sqlite:///./data/processed/engine_twin.db"
    log_level: str = "INFO"

    telemetry_mode: str = "simulated"  # simulated | can | serial
    can_channel: str = "can0"
    serial_port: str = "/dev/ttyUSB0"
    serial_baudrate: int = 115200

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
