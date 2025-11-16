import os
import google.generativeai as genai
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GeminiClient:
    """Client pour interagir avec l'API Gemini"""
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        """Initialise le client Gemini avec une clé API et un modèle"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("La clé API Gemini est requise. Définissez GEMINI_API_KEY dans vos variables d'environnement.")
        
        # Configure Google Gemini
        genai.configure(api_key=self.api_key)

        # Vérifie que le modèle est valide
        self.model_name = model_name
        self.model = genai.GenerativeModel(self.model_name)
        logger.info(f"✅ Client Gemini initialisé avec le modèle : {self.model_name}")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Génère du texte à partir d’un prompt"""
        try:
            generation_config = {
                "temperature": 0.7,
                "max_output_tokens": 1024,
                "top_p": 0.95,
                "top_k": 40,
            }
            generation_config.update(kwargs)
            response = await self.model.generate_content_async(
                prompt,
                generation_config=generation_config,
            )
            return response.text
        except Exception as e:
            logger.error(f"❌ Erreur Gemini: {str(e)}")
            raise

    async def chat(self, messages: list[Dict[str, str]], **kwargs) -> str:
        """Effectue une conversation avec le modèle"""
        try:
            chat = self.model.start_chat(history=[])
            response = await chat.send_message_async(messages[-1]["content"], **kwargs)
            return response.text
        except Exception as e:
            logger.error(f"❌ Erreur de chat Gemini: {str(e)}")
            raise


# Singleton global
gemini_client = None

def get_gemini_client() -> GeminiClient:
    """Retourne une instance unique du client Gemini"""
    global gemini_client
    if gemini_client is None:
        gemini_client = GeminiClient(model_name="gemini-2.5-flash")
    return gemini_client
