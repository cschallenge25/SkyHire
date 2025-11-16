"""
Générateur de réponses pour le chatbot Career Coach
Intègre l'API Gemini avec un système de secours FAQ local
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

# Import du client Gemini personnalisé
from .gemini_client import get_gemini_client

# Configuration du logging
logger = logging.getLogger(__name__)

# Configuration des prompts spécifiques au domaine aéronautique
AEROSPACE_PROMPT = """
Tu es un assistant de carrière expert dans le secteur aéronautique, spécialisé dans l'accompagnement du personnel navigant (hôtesses, stewards, PNC).
Ton rôle est de fournir des conseils professionnels précis et pertinents pour ce secteur spécifique.

Points clés à respecter :
- Utilise un langage professionnel mais accessible
- Sois précis sur les certifications et formations (SMURF, MCC, etc.)
- Mentionne les spécificités du métier (décalages horaires, conditions de travail, etc.)
- Reste à jour avec les dernières réglementations aériennes
- Privilégie les réponses concrètes et actionnables

Si la question sort de ton domaine d'expertise, indique-le clairement.
"""

class ResponseGenerator:
    """Generates responses using Gemini API with FAQ fallback"""
    
    def __init__(self, faq_path: str = None):
        """
        Initialise le générateur de réponses
        
        Args:
            faq_path: Chemin vers le fichier JSON de la FAQ
        """
        self.faq = self._load_faq(faq_path) if faq_path else {}
        self.gemini_client = None
        self._init_gemini()
    
    def _init_gemini(self):
        """Initialise le client Gemini de manière sécurisée"""
        try:
            self.gemini_client = get_gemini_client()
            logger.info("Client Gemini initialisé avec succès")
        except Exception as e:
            logger.warning(f"Impossible d'initialiser le client Gemini: {e}")
            self.gemini_client = None
    
    def _load_faq(self, faq_path: str) -> Dict:
        """Load FAQ from JSON file with improved path resolution"""
        try:
            # Convertir le chemin en Path object pour une meilleure manipulation
            faq_path = Path(faq_path)
            
            # Si le chemin n'est pas absolu, essayer de le résoudre par rapport au répertoire du module
            if not faq_path.is_absolute():
                # Essayer de trouver le fichier dans plusieurs emplacements possibles
                possible_paths = [
                    faq_path,  # Chemin relatif direct
                    Path(__file__).parent / faq_path,  # Par rapport au répertoire du module
                    Path(__file__).parent.parent / faq_path,  # Un niveau au-dessus
                    Path("data") / faq_path,  # Dans le dossier data
                ]
                
                # Essayer chaque chemin jusqu'à trouver un fichier valide
                for path in possible_paths:
                    if path.exists() and path.is_file():
                        faq_path = path
                        break
                else:
                    # Aucun fichier trouvé, utiliser le chemin d'origine pour l'erreur
                    raise FileNotFoundError(f"Aucun fichier FAQ trouvé aux emplacements: {', '.join(str(p) for p in possible_paths)}")
            
            # Charger le fichier
            with open(faq_path, 'r', encoding='utf-8') as f:
                faq_data = json.load(f)
                
            logger.info(f"FAQ chargée depuis: {faq_path}")
            return faq_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Erreur de décodage du fichier FAQ {faq_path}: {e}")
            return {"intents": {}}
        except Exception as e:
            logger.error(f"Erreur lors du chargement du fichier FAQ {faq_path}: {e}")
            return {"intents": {}}
    
    def _find_in_faq(self, intent: str, user_message: str) -> Optional[Dict]:
        """
        Search for response in FAQ
        
        Args:
            intent: Detected intent
            user_message: User's message for context
            
        Returns:
            Response dict if found, None otherwise
        """
        if not self.faq or "intents" not in self.faq:
            logger.warning("Aucune FAQ chargée ou format de FAQ invalide")
            return None
            
        # Normaliser l'intention (supprimer les caractères spéciaux et mettre en minuscules)
        normalized_intent = ''.join(c.lower() for c in str(intent) if c.isalnum() or c == '_')
        
        # Essayer de trouver une correspondance exacte avec l'intention normalisée
        for faq_intent, data in self.faq.get("intents", {}).items():
            # Normaliser l'intention de la FAQ pour la comparaison
            normalized_faq_intent = ''.join(c.lower() for c in str(faq_intent) if c.isalnum() or c == '_')
            
            # Vérifier la correspondance exacte avec l'intention normalisée
            if normalized_intent == normalized_faq_intent:
                logger.info(f"Correspondance exacte trouvée pour l'intention: {intent}")
                return data
        
        # Si aucune correspondance exacte, essayer la correspondance partielle
        for faq_intent, data in self.faq.get("intents", {}).items():
            normalized_faq_intent = ''.join(c.lower() for c in str(faq_intent) if c.isalnum() or c == '_')
            if normalized_faq_intent in normalized_intent or normalized_intent in normalized_faq_intent:
                logger.info(f"Correspondance partielle trouvée pour l'intention: {intent} -> {faq_intent}")
                return data
        
        # En dernier recours, essayer la correspondance par mots-clés dans le message
        user_message_lower = user_message.lower()
        for faq_intent, data in self.faq.get("intents", {}).items():
            for keyword in data.get("keywords", []):
                if keyword.lower() in user_message_lower:
                    logger.info(f"Correspondance par mot-clé trouvée: {keyword} dans le message")
                    return data
                    
        logger.warning(f"Aucune correspondance trouvée dans la FAQ pour l'intention: {intent}")
        return None
    
    async def _generate_with_gemini(self, user_message: str, context: Dict) -> Dict:
        """
        Generate response using Gemini API
        
        Args:
            user_message: User's message
            context: Conversation context
            
        Returns:
            Response dictionary
        """
        if not self.gemini_client:
            return {
                "text": "Désolé, le service de génération de réponses n'est pas disponible pour le moment.",
                "suggestions": ["Voir l'aide", "Contacter le support"]
            }
        
        try:
            # Build the prompt with context
            prompt = f"""{AEROSPACE_PROMPT}
            
            Contexte de la conversation:
            - Utilisateur: {context.get('user_id', 'Nouvel utilisateur')}
            - Dernière intention détectée: {context.get('intent', 'Inconnue')}
            - Historique récent: {context.get('last_messages', [])[-3:]}
            
            Message de l'utilisateur: {user_message}
            
            Réponds de manière professionnelle en français, en te concentrant sur les aspects carrière dans l'aérien.
            Si la question concerne un sujet hors de ton domaine, explique-le poliment.
            """
            
            response_text = await self.gemini_client.generate_text(prompt)
            
            return {
                "text": response_text.strip(),
                "source": "gemini",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error generating response with Gemini: {e}")
            return {
                "text": "Je rencontre des difficultés techniques pour générer une réponse. Veuillez réessayer plus tard.",
                "source": "error",
                "suggestions": ["Réessayer", "Contacter le support"]
            }
    
    def _format_response(self, response_data: Dict, intent: str, context: Dict) -> Dict:
        """
        Format the final response with metadata
        
        Args:
            response_data: Raw response data
            intent: Detected intent
            context: Conversation context
            
        Returns:
            Formatted response dictionary
        """
        if not isinstance(response_data, dict):
            response_data = {"text": str(response_data)}
            
        # Add default values if missing
        response_data.setdefault("text", "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?")
        response_data.setdefault("suggestions", [])
        response_data.setdefault("source", "faq" if "faq" in response_data.get("source", "") else "generated")
        response_data["intent"] = intent
        response_data["timestamp"] = datetime.utcnow().isoformat()
        
        # Add context for debugging
        response_data["_debug"] = {
            "intent": intent,
            "context_keys": list(context.keys()),
            "response_source": response_data["source"]
        }
        
        return response_data
    
    async def generate_response(
        self, 
        user_message: str, 
        intent: str, 
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Génère une réponse au message de l'utilisateur
        
        Args:
            user_message: Le message de l'utilisateur
            intent: L'intention détectée
            context: Contexte de conversation optionnel
            
        Returns:
            Dictionnaire contenant la réponse et les métadonnées
        """
        # Contexte par défaut si non fourni
        context = context or {}
        
        logger.info(f"Tentative de génération de réponse pour l'intention: {intent}")
        
        # D'abord chercher dans la FAQ
        faq_response = self._find_in_faq(intent, user_message)
        if faq_response:
            logger.info(f"✅ Réponse trouvée dans la FAQ pour l'intention: {intent}")
            return self._format_response(faq_response, intent, context)
        else:
            logger.warning(f"❌ Aucune correspondance dans la FAQ pour l'intention: {intent}")
            
        # Si pas de correspondance dans la FAQ et que Gemini est disponible
        if self.gemini_client:
            try:
                logger.info(f"🔍 Tentative de génération avec Gemini pour l'intention: {intent}")
                gemini_response = await self._generate_with_gemini(user_message, context)
                if gemini_response and gemini_response.get("text"):
                    logger.info("✅ Réponse générée avec succès par Gemini")
                    return gemini_response
                else:
                    logger.warning("❌ Réponse vide de Gemini")
            except Exception as e:
                logger.error(f"❌ Erreur avec Gemini: {e}", exc_info=True)
        else:
            logger.warning("🔴 Client Gemini non disponible")
        
        # Réponse de secours
        fallback_responses = [
            "Je n'ai pas pu trouver de réponse appropriée dans ma base de connaissances. Pouvez-vous reformuler votre question ou la poser différemment ?",
            "Je ne suis pas sûr de bien comprendre votre demande. Pourriez-vous la reformuler ?",
            "Je n'ai pas d'information précise sur ce sujet. Avez-vous une autre question ?"
        ]
        
        import random
        fallback_text = random.choice(fallback_responses)
        
        logger.warning(f"🔄 Utilisation d'une réponse de secours pour l'intention: {intent}")
        return self._format_response(
            {
                "text": fallback_text,
                "source": "fallback",
                "suggestions": ["Voir l'aide", "Poser une autre question"]
            },
            intent,
            context
        )

# Example usage
if __name__ == "__main__":
    import asyncio
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    async def test_response_generator():
        # Initialize with test FAQ
        faq_path = Path(__file__).parent / "chatbot_faq.json"
        generator = ResponseGenerator(faq_path=str(faq_path))
        
        test_cases = [
            ("Comment rédiger un bon CV pour une compagnie aérienne ?", "CV_Advice"),
            ("Quelles sont les questions d'entretien pour Emirates ?", "Interview_Tips"),
            ("Quel est le salaire moyen d'un PNC ?", "Job_Matching"),
            ("Quelle est la capitale de la France ?", "General_Chat")
        ]
        
        for message, intent in test_cases:
            print(f"\nMessage: {message}")
            print(f"Intent: {intent}")
            
            response = await generator.generate_response(
                user_message=message,
                intent=intent,
                context={"user_id": "test_user"}
            )
            
            print(f"Response: {response['text']}")
            print(f"Source: {response['source']}")
            if response.get('suggestions'):
                print(f"Suggestions: {', '.join(response['suggestions'])}")
            print("-" * 80)
    
    asyncio.run(test_response_generator())