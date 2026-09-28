import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'stayease-super-secret-jwt-key-2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'stayease-jwt-secret-token-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 86400)) # 24 hours
    
    # Database configuration
    DB_USER = os.getenv('DB_USER', 'stayease_user')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'stayease_pass_2026')
    DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME', 'stayease_db')
    
    USE_SQLITE_FALLBACK = os.getenv('USE_SQLITE_FALLBACK', 'true').lower() in ('true', '1', 'yes')
    
    # Primary MySQL connection string
    MYSQL_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    
    # Allow explicit override via DATABASE_URL
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', MYSQL_URI)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True
    }
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
