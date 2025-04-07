import os

SECRET_KEY = os.getenv("SECRET_KEY", "a-very-secret-key-for-dev-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
