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
    BACKEND_CORS_ORIGINS: str = ""
    ALLOWED_ORIGINS: str = ""
    TEMP_DIR_ROOT: str = ""

    @property
    def max_upload_size_bytes(self) -> int:
        return max(1, self.MAX_UPLOAD_SIZE_MB) * 1024 * 1024

    @property
    def cors_origin_list(self) -> List[str]:
        raw_values = [self.CORS_ORIGINS, self.BACKEND_CORS_ORIGINS, self.ALLOWED_ORIGINS]
        origins: List[str] = []
        for raw in raw_values:
            text = (raw or "").strip()
            if not text:
                continue
            if text.startswith("["):
                try:
                    import json
                    parsed = json.loads(text)
                    if isinstance(parsed, list):
                        origins.extend(str(item).strip() for item in parsed if str(item).strip())
                        continue
                except Exception:
                    pass
            origins.extend(o.strip() for o in text.split(",") if o.strip())
        defaults = ["http://localhost:5173", "https://fin-sync-ten.vercel.app"]
        for d in defaults:
            if d not in origins:
                origins.append(d)
        return origins or defaults

    @property
    def temp_root_path(self) -> Path:
        if self.TEMP_DIR_ROOT.strip():
            return Path(self.TEMP_DIR_ROOT.strip()).resolve()
        return Path.cwd() / ".finsync_tmp"


settings = Settings()