import os
import json
import hashlib
import secrets
import time
from typing import Optional, Tuple, Dict, Any

AUTH_FILE_LOCAL = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "auth_config.json")
AUTH_FILE_TMP = "/tmp/auth_config.json"

SECRET_KEY = os.environ.get("QUICK2B_SECRET_KEY", "quick2b-enterprise-secret-key-2026")

DEFAULT_USER_ID = "admin"
DEFAULT_PASSWORD = "Quick2B@2026"

def _hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()

class AuthManager:
    def __init__(self):
        self._user_id = DEFAULT_USER_ID
        self._salt = secrets.token_hex(16)
        self._password_hash = _hash_password(DEFAULT_PASSWORD, self._salt)
        self._active_sessions: Dict[str, float] = {} # token -> expiry timestamp
        self._load_config()

    def _get_target_file(self) -> str:
        # If running on Vercel / read-only filesystem, use /tmp
        if os.environ.get("VERCEL") or not os.access(os.path.dirname(AUTH_FILE_LOCAL), os.W_OK):
            return AUTH_FILE_TMP
        return AUTH_FILE_LOCAL

    def _load_config(self):
        # Try local first, then tmp
        for path in [AUTH_FILE_LOCAL, AUTH_FILE_TMP]:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        self._user_id = data.get("user_id", DEFAULT_USER_ID)
                        self._salt = data.get("salt", self._salt)
                        self._password_hash = data.get("password_hash", self._password_hash)
                        return
                except Exception as e:
                    print(f"Error loading auth config from {path}: {e}")

        # Initialize and save default config
        self._save_config()

    def _save_config(self):
        target = self._get_target_file()
        try:
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "w", encoding="utf-8") as f:
                json.dump({
                    "user_id": self._user_id,
                    "salt": self._salt,
                    "password_hash": self._password_hash,
                    "updated_at": time.time()
                }, f, indent=2)
        except Exception as e:
            print(f"Warning: could not persist auth config to {target}: {e}")

    def verify_login(self, user_id: str, password: str) -> Optional[str]:
        if user_id.strip() != self._user_id:
            return None
        candidate_hash = _hash_password(password, self._salt)
        if secrets.compare_digest(candidate_hash, self._password_hash):
            # Create session token (valid for 30 days)
            token = secrets.token_urlsafe(32)
            self._active_sessions[token] = time.time() + (30 * 24 * 3600)
            return token
        return None

    def validate_token(self, token: str) -> bool:
        if not token:
            return False
        expiry = self._active_sessions.get(token)
        if expiry and expiry > time.time():
            return True
        return False

    def change_credentials(self, current_user_id: str, current_password: str, new_user_id: str, new_password: str) -> Tuple[bool, str]:
        # 1. Verify current credentials
        if current_user_id.strip() != self._user_id:
            return False, "Current User ID does not match."
        candidate_hash = _hash_password(current_password, self._salt)
        if not secrets.compare_digest(candidate_hash, self._password_hash):
            return False, "Current password is incorrect."

        # 2. Validate new inputs
        new_uid = new_user_id.strip()
        if len(new_uid) < 3:
            return False, "New User ID must be at least 3 characters."
        if len(new_password) < 6:
            return False, "New password must be at least 6 characters."

        # 3. Update credentials
        self._user_id = new_uid
        self._salt = secrets.token_hex(16)
        self._password_hash = _hash_password(new_password, self._salt)
        self._save_config()

        # Invalidate old sessions
        self._active_sessions.clear()
        new_token = secrets.token_urlsafe(32)
        self._active_sessions[new_token] = time.time() + (30 * 24 * 3600)

        return True, new_token

    def get_current_user_id(self) -> str:
        return self._user_id

auth_manager = AuthManager()
