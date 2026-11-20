from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "FinSync Reconciliation API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "production"

    MAX_UPLOAD_SIZE_MB: int = 20
    MAX_PREVIEW_ROWS: int = 100
    REQUEST_RATE_LIMIT_PER_MINUTE: int = 120
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    TEMP_DIR_ROOT: str = ""

    @property
    def max_upload_size_bytes(self) -> int:
        return max(1, self.MAX_UPLOAD_SIZE_MB) * 1024 * 1024

    @property
    def cors_origin_list(self) -> List[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        return origins or ["http://localhost:5173"]

    @property
    def temp_root_path(self) -> Path:
        if self.TEMP_DIR_ROOT.strip():
            return Path(self.TEMP_DIR_ROOT.strip()).resolve()
        return Path.cwd() / ".finsync_tmp"


settings = Settings()