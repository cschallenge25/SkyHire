"""
Routes FastAPI pour le chatbot de conseil en carrière aéronautique
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import os

from chatbot.dialogue_manager import DialogueManager
from chatbot.response_generator import ResponseGenerator
from chatbot.intent_classifier import CareerCoachChatbot

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation du routeur
router = APIRouter(
    prefix="/chat",
    tags=["chatbot"],
    responses={404: {"description": "Not found"}},
)

# Initialisation des composants du chatbot
DIALOGUE_MANAGER = None

def get_dialogue_manager():
    """Initialise et retourne le gestionnaire de dialogue (singleton)"""
    global DIALOGUE_MANAGER
    if DIALOGUE_MANAGER is None:
        try:
            DIALOGUE_MANAGER = DialogueManager(
                storage_path="data/context_memory.json"
            )
            logger.info("DialogueManager initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du DialogueManager: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur d'initialisation du chatbot"
            )
    return DIALOGUE_MANAGER

# Modèles Pydantic
class ChatMessage(BaseModel):
    """Modèle pour un message de chat"""
    role: str = Field(..., description="Rôle de l'émetteur (user/assistant)")
    content: str = Field(..., description="Contenu du message")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ChatRequest(BaseModel):
    """Modèle pour une requête de chat"""
    user_id: str = Field(..., description="Identifiant unique de l'utilisateur")
    message: str = Field(..., description="Message de l'utilisateur")
    session_id: Optional[str] = Field(None, description="ID de session (auto-généré si non fourni)")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Métadonnées supplémentaires"
    )

class ChatResponse(BaseModel):
    """Modèle pour une réponse du chatbot"""
    text: str = Field(..., description="Réponse du chatbot")
    session_id: str = Field(..., description="ID de session")
    intent: Optional[str] = Field(None, description="Intention détectée")
    confidence: Optional[float] = Field(None, description="Niveau de confiance de l'intention")
    suggestions: Optional[List[str]] = Field(default_factory=list, description="Suggestions de réponses")
    metadata: Dict[str, Any] = Field(default_factory=dict)

# Endpoints
@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Envoyer un message au chatbot",
    description="Traite un message utilisateur et renvoie une réponse du chatbot"
)
async def chat(
    request: ChatRequest,
    dialogue_manager: DialogueManager = Depends(get_dialogue_manager)
) -> ChatResponse:
    """
    Traite un message utilisateur et renvoie une réponse du chatbot
    """
    try:
        # Traitement du message avec le gestionnaire de dialogue
        response = await dialogue_manager.process_message(
            user_id=request.user_id,
            message=request.message
        )

        if "response" not in response or not isinstance(response["response"], dict):
            response["response"] = {"text": "Désolé, je n'ai pas pu comprendre la réponse du moteur."}
        
        # Extraction des informations pertinentes
        context = response.get("context", {})
        
        # Extraire les informations de la réponse
        response_data = {
            "text": response.get("response", {}).get("text", "Désolé, je n'ai pas pu traiter votre demande."),
            "session_id": context.get("session_id", ""),
            "intent": context.get("current_intent"),
            "confidence": response.get("intent_confidence", 0.0),
            "suggestions": response.get("response", {}).get("suggestions", []),
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "intent_confidence": response.get("intent_confidence", 0.0),
                "response_source": response.get("response", {}).get("source", "faq")
            }
        }
        
        # Créer la réponse avec le modèle Pydantic
        return ChatResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Erreur lors du traitement du message: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du traitement du message: {str(e)}"
        )

@router.get(
    "/context/{user_id}",
    response_model=Dict[str, Any],
    summary="Récupérer le contexte d'un utilisateur",
    description="Récupère le contexte de conversation d'un utilisateur"
)
async def get_user_context(
    user_id: str,
    dialogue_manager: DialogueManager = Depends(get_dialogue_manager)
) -> Dict[str, Any]:
    """Récupère le contexte de conversation d'un utilisateur"""
    try:
        context = dialogue_manager.get_or_create_context(user_id)
        return context.to_dict()
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du contexte: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du contexte: {str(e)}"
        )

@router.delete(
    "/context/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Réinitialiser le contexte d'un utilisateur",
    description="Réinitialise le contexte de conversation d'un utilisateur"
)
async def reset_context(
    user_id: str,
    dialogue_manager: DialogueManager = Depends(get_dialogue_manager)
):
    """Réinitialise le contexte de conversation d'un utilisateur"""
    try:
        dialogue_manager.end_session(user_id)
        return {"status": "success", "message": "Contexte réinitialisé avec succès"}
    except Exception as e:
        logger.error(f"Erreur lors de la réinitialisation du contexte: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la réinitialisation du contexte: {str(e)}"
        )

# The middleware was causing: AttributeError: 'APIRouter' object has no attribute 'middleware'
