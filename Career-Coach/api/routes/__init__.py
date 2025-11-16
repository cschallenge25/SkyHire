"""
Module d'export des routes de l'API
"""
from fastapi import APIRouter
from . import chatbot

# Création du routeur principal
api_router = APIRouter()

# Inclusion des routes du chatbot
api_router.include_router(
    chatbot.router,
    tags=["chatbot"]
)

# Vous pouvez ajouter d'autres routeurs ici
# api_router.include_router(autre_router, prefix="/autre", tags=["autre"])

# Export du routeur principal
__all__ = ['api_router']
