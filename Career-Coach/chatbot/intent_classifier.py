"""
Career Coach Chatbot - Version ChatGPT-like
Utilise directement Gemini API pour toutes les réponses sans classification d'intents
"""

import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass
import re
from chatbot.gemini_client import GeminiClient

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ChatResponse:
    response: str
    confidence: float = 1.0
    processing_time: float = 0.0

class CareerCoachChatbot:
    def __init__(self, use_gemini: bool = True):
        """
        Initialize the ChatGPT-like career coach
        
        Args:
            use_gemini: Whether to use Gemini API for all responses
        """
        self.use_gemini = use_gemini
        self.conversation_history = []
        
        # Context métier pour guider Gemini sans restrictions strictes
        self.career_context = """
        Tu es un conseiller de carrière expert dans l'aviation civile, spécialisé dans les métiers de Personnel Navigant Commercial (PNC) - hôtesses de l'air et stewards.

        Domaines d'expertise :
        - Compétences requises pour devenir PNC
        - Conseils CV et lettres de motivation pour l'aviation
        - Préparation aux entretiens avec les compagnies aériennes
        - Formations et certifications (SMURF, sécurité, premiers secours)
        - Marché de l'emploi dans l'aviation civile
        - Évolution de carrière (chef de cabine, instructeur, etc.)

        Ta mission : Aider les candidats avec des conseils pratiques, personnalisés et précis sur les métiers du PNC.

        Si on te pose des questions hors de ton domaine d'expertise, réponds de manière utile tout en recentrant si possible sur l'aviation, ou explique poliment que tu es spécialisé dans ce domaine.
        """
    
    async def _call_gemini(self, user_message: str, conversation_context: list = None) -> str:
        """Appel direct à l'API Gemini avec contexte de conversation"""
        try:
            
            
            # Construction du prompt avec historique de conversation
            prompt = f"{self.career_context}\n\n"
            
            # Ajout de l'historique de conversation si disponible
            if conversation_context:
                for msg in conversation_context[-6:]:  # Garder les 6 derniers messages
                    prompt += f"{msg['role']}: {msg['content']}\n"
            
            prompt += f"Utilisateur: {user_message}\nAssistant:"
            
            gemini = GeminiClient()
            response = await gemini.generate_text(prompt)
            
            # Nettoyage de la réponse
            cleaned_response = self._clean_response(response)
            return cleaned_response
            
        except ImportError:
            error_msg = "Service Gemini non disponible pour le moment."
            logger.error("Gemini client not available")
            return error_msg
        except Exception as e:
            error_msg = f"Désolé, une erreur s'est produite lors du traitement de votre demande."
            logger.error(f"Gemini API error: {e}")
            return error_msg
    
    def _clean_response(self, response: str) -> str:
        """Nettoie et formate la réponse de Gemini"""
        # Supprime les préfixes indésirables
        response = re.sub(r'^(Assistant|AI|Bot):\s*', '', response.strip())
        
        # Assure que la réponse se termine par un point si ce n'est pas le cas
        if response and not response.endswith(('.', '!', '?')):
            response += '.'
            
        return response
    
    def _is_greeting(self, text: str) -> bool:
        """Détecte les salutations pour des réponses plus naturelles"""
        greetings = ["bonjour", "salut", "hello", "hi", "coucou", "hey"]
        return any(greeting in text.lower() for greeting in greetings)
    
    def _is_thanks(self, text: str) -> bool:
        """Détecte les remerciements"""
        thanks = ["merci", "thank you", "thanks", "merci beaucoup"]
        return any(thank in text.lower() for thank in thanks)
    
    async def send_message(self, user_message: str) -> ChatResponse:
        """
        Traite n'importe quel message utilisateur comme ChatGPT
        
        Args:
            user_message: Le message de l'utilisateur
            
        Returns:
            ChatResponse avec la réponse générée
        """
        import time
        start_time = time.time()
        
        logger.info(f"💬 Message reçu: '{user_message}'")
        
        if not user_message.strip():
            return ChatResponse(
                response="Bonjour ! Comment puis-je vous aider dans votre projet de carrière dans l'aviation ?",
                confidence=1.0,
                processing_time=0.0
            )
        
        # Réponses rapides pour les salutations et remerciements (optionnel)
        if self._is_greeting(user_message):
            response = "Bonjour ! 👋 Je suis votre conseiller carrière spécialisé dans l'aviation. Comment puis-je vous aider aujourd'hui pour votre projet de devenir hôtesse de l'air ou steward ?"
            processing_time = time.time() - start_time
            return ChatResponse(response=response, processing_time=processing_time)
        
        if self._is_thanks(user_message):
            response = "Je vous en prie ! N'hésitez pas si vous avez d'autres questions sur votre carrière dans l'aviation. 😊"
            processing_time = time.time() - start_time
            return ChatResponse(response=response, processing_time=processing_time)
        
        # Utilisation de Gemini pour toutes les autres réponses
        if self.use_gemini:
            # Mise à jour de l'historique de conversation
            self.conversation_history.append({"role": "user", "content": user_message})
            
            # Appel à Gemini
            gemini_response = await self._call_gemini(user_message, self.conversation_history)
            
            # Ajout de la réponse à l'historique
            self.conversation_history.append({"role": "assistant", "content": gemini_response})
            
            # Limiter la taille de l'historique
            if len(self.conversation_history) > 10:  # Garder les 10 derniers échanges
                self.conversation_history = self.conversation_history[-10:]
            
            processing_time = time.time() - start_time
            logger.info(f"✅ Réponse générée en {processing_time:.2f}s")
            
            return ChatResponse(
                response=gemini_response,
                confidence=0.9,  # Haute confiance pour Gemini
                processing_time=processing_time
            )
        else:
            # Fallback simple si Gemini n'est pas disponible
            response = "Je suis un assistant spécialisé dans les carrières de l'aviation. Posez-moi vos questions sur les métiers de PNC, les formations, les entretiens, ou tout autre sujet lié à l'aviation civile !"
            processing_time = time.time() - start_time
            return ChatResponse(response=response, processing_time=processing_time)
    
    def clear_conversation(self):
        """Réinitialise l'historique de conversation"""
        self.conversation_history = []
        logger.info("Historique de conversation effacé")
    
    def get_conversation_summary(self) -> Dict[str, Any]:
        """Retourne un résumé de la conversation"""
        return {
            "total_messages": len(self.conversation_history),
            "user_messages": len([msg for msg in self.conversation_history if msg["role"] == "user"]),
            "assistant_messages": len([msg for msg in self.conversation_history if msg["role"] == "assistant"])
        }


# Version simplifiée pour une utilisation directe
class SimpleCareerCoach:
    """Version ultra-simplifiée sans historique"""
    
    def __init__(self):
        self.system_prompt = """
        Tu es un conseiller de carrière expert dans l'aviation civile (hôtesses de l'air, stewards, PNC).
        Réponds de manière naturelle et utile à toutes les questions, en te concentrant sur ton domaine d'expertise.
        Sois précis, pratique et encourageant dans tes réponses.
        """
    
    async def ask(self, question: str) -> str:
        """Pose une question et obtient une réponse directe"""
        try:
         
            prompt = f"{self.system_prompt}\n\nQuestion: {question}\nRéponse:"
            
            gemini = GeminiClient()
            response = await gemini.generate_text(prompt)
            
            return response.strip()
            
        except Exception as e:
            return f"Je suis désolé, je ne peux pas répondre pour le moment. Erreur: {e}"


# Exemple d'utilisation
if __name__ == "__main__":
    import asyncio
    
    async def test_chatgpt_style():
        """Test du mode ChatGPT-like"""
        bot = CareerCoachChatbot()
        
        test_questions = [
            "Bonjour !",
            "Quelles sont les compétences nécessaires pour devenir hôtesse de l'air ?",
            "Comment préparer mon CV pour une compagnie aérienne ?",
            "Quelle est la durée de la formation PNC ?",
            "Est-ce que c'est difficile de trouver du travail dans l'aviation ?",
            "Quels sont les avantages du métier de steward ?",
            "Merci pour tes conseils !",
            "Quel temps fera-t-il demain ?"  # Question hors domaine
        ]
        
        print("🤖 Career Coach ChatGPT-like - Test\n")
        
        for question in test_questions:
            print(f"👤 Vous: {question}")
            response = await bot.send_message(question)
            print(f"🤖 Coach: {response.response}")
            print(f"   ⏱ {response.processing_time:.2f}s | Confiance: {response.confidence:.1f}")
            print("-" * 60)
        
        # Résumé de la conversation
        summary = bot.get_conversation_summary()
        print(f"\n📊 Résumé: {summary['total_messages']} messages échangés")
    
    # Test de la version simple
    async def test_simple_version():
        """Test de la version ultra-simple"""
        print("\n🧪 Test version simple:")
        coach = SimpleCareerCoach()
        
        question = "Quelles études faut-il faire pour devenir steward ?"
        response = await coach.ask(question)
        
        print(f"Question: {question}")
        print(f"Réponse: {response}")
    
    # Exécution des tests
    asyncio.run(test_chatgpt_style())
    asyncio.run(test_simple_version())


