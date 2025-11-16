"""
Configuration de l'API FastAPI
"""
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Configuration de l'API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Career Coach API"
    VERSION: str = "1.0.0"
    
    # Configuration CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",  # Frontend React par défaut
        "http://127.0.0.1:3000",
    ]
    
    # Configuration du chatbot
    CHATBOT_FAQ_PATH: str = "chatbot/chatbot_faq.json"
    CONTEXT_STORAGE_PATH: str = "data/context_memory.json"
    
    # Configuration de la sécurité
    SECRET_KEY: str = "votre-clé-secrète-très-longue-ici"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 jours
    
    class Config:
        case_sensitive = True

# Instance des paramètres
settings = Settings()
