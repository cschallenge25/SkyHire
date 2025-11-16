"""
Dialogue Manager for Career Coach Chatbot
Manages conversation context and user sessions
"""

import json
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
import asyncio
from .intent_classifier import CareerCoachChatbot
from .response_generator import ResponseGenerator

class UserProfile:
    """Représente le profil d'un utilisateur"""
    
    def __init__(self, user_id: str = None):
        self.user_id = user_id or str(uuid.uuid4())
        self.first_name: Optional[str] = None
        self.last_name: Optional[str] = None
        self.email: Optional[str] = None
        self.role: Optional[str] = None  # PNC, Chef de Cabine, etc.
        self.experience_years: int = 0
        self.languages: List[str] = ["Français"]
        self.preferences: Dict[str, Any] = {
            "notification_enabled": True,
            "language": "fr",
            "theme": "light"
        }
        self.skills: List[str] = []
        self.certifications: List[str] = []
        self.last_active: datetime = datetime.utcnow()
        self.created_at: datetime = datetime.utcnow()
    
    def to_dict(self) -> Dict:
        """Convertit le profil en dictionnaire pour la sérialisation"""
        return {
            "user_id": self.user_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "role": self.role,
            "experience_years": self.experience_years,
            "languages": self.languages,
            "preferences": self.preferences,
            "skills": self.skills,
            "certifications": self.certifications,
            "last_active": self.last_active.isoformat(),
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'UserProfile':
        """Crée un UserProfile à partir d'un dictionnaire"""
        profile = cls(data.get("user_id"))
        profile.first_name = data.get("first_name")
        profile.last_name = data.get("last_name")
        profile.email = data.get("email")
        profile.role = data.get("role")
        profile.experience_years = data.get("experience_years", 0)
        profile.languages = data.get("languages", ["Français"])
        profile.preferences = data.get("preferences", {})
        profile.skills = data.get("skills", [])
        profile.certifications = data.get("certifications", [])
        
        # Gestion des dates
        if "last_active" in data and data["last_active"]:
            profile.last_active = datetime.fromisoformat(data["last_active"])
        if "created_at" in data and data["created_at"]:
            profile.created_at = datetime.fromisoformat(data["created_at"])
            
        return profile

class ConversationContext:
    """Gère le contexte d'une conversation"""
    
    def __init__(self, user_id: str, max_history: int = 10):
        self.user_id = user_id
        self.session_id = str(uuid.uuid4())
        self.created_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()
        self.messages: List[Dict] = []
        self.current_intent: Optional[str] = None
        self.entities: Dict = {}
        self.slots: Dict = {}
        self.max_history = max_history
    
    def add_message(self, role: str, content: str, intent: str = None, **kwargs):
        """Ajoute un message au contexte"""
        message = {
            "timestamp": datetime.utcnow().isoformat(),
            "role": role,
            "content": content,
            "intent": intent,
            **kwargs
        }
        self.messages.append(message)
        self.last_activity = datetime.utcnow()
        
        # Garder uniquement les N derniers messages
        if len(self.messages) > self.max_history:
            self.messages = self.messages[-self.max_history:]
    
    def get_last_messages(self, n: int = 3) -> List[Dict]:
        """Récupère les N derniers messages"""
        return self.messages[-n:] if self.messages else []
    
    def to_dict(self) -> Dict:
        """Sérialise le contexte en dictionnaire"""
        return {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "current_intent": self.current_intent,
            "entities": self.entities,
            "slots": self.slots,
            "messages": self.messages
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'ConversationContext':
        """Crée un contexte à partir d'un dictionnaire"""
        context = cls(
            user_id=data["user_id"],
            max_history=data.get("max_history", 10)
        )
        context.session_id = data.get("session_id", str(uuid.uuid4()))
        context.created_at = datetime.fromisoformat(data["created_at"])
        context.last_activity = datetime.fromisoformat(data["last_activity"])
        context.current_intent = data.get("current_intent")
        context.entities = data.get("entities", {})
        context.slots = data.get("slots", {})
        context.messages = data.get("messages", [])
        return context

class DialogueManager:
    """Gère les conversations utilisateur et le contexte"""
    
    def __init__(self, storage_path: str = "data/context_memory.json"):
        """
        Initialise le gestionnaire de dialogue
        
        Args:
            storage_path: Chemin vers le fichier de stockage des contextes
        """
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.contexts: Dict[str, ConversationContext] = {}
        self.user_profiles: Dict[str, UserProfile] = {}
        # Utiliser le nouveau CareerCoachChatbot
        self.chatbot = CareerCoachChatbot(use_gemini=True)
        # Conserver l'ancien response_generator pour compatibilité
        faq_path = Path(__file__).parent.parent / "data" / "chatbot_faq.json"
        self.response_generator = ResponseGenerator(faq_path=str(faq_path))
        self._load_contexts()
    
    def _load_contexts(self):
        """Charge les contextes depuis le fichier"""
        try:
            if self.storage_path.exists():
                with open(self.storage_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.contexts = {
                        user_id: ConversationContext.from_dict(ctx_data)
                        for user_id, ctx_data in data.get("contexts", {}).items()
                    }
                    self.user_profiles = {
                        user_id: UserProfile.from_dict(profile_data)
                        for user_id, profile_data in data.get("profiles", {}).items()
                    }
        except Exception as e:
            print(f"Erreur lors du chargement des contextes: {e}")
            self.contexts = {}
            self.user_profiles = {}
    
    def _save_contexts(self):
        """Sauvegarde les contextes dans le fichier"""
        try:
            data = {
                "contexts": {
                    user_id: ctx.to_dict()
                    for user_id, ctx in self.contexts.items()
                },
                "profiles": {
                    user_id: profile.to_dict()
                    for user_id, profile in self.user_profiles.items()
                },
                "last_updated": datetime.utcnow().isoformat()
            }
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Erreur lors de la sauvegarde des contextes: {e}")
    
    def _cleanup_old_contexts(self, max_age_days: int = 30):
        """Nettoie les anciens contextes inactifs"""
        cutoff = datetime.utcnow() - timedelta(days=max_age_days)
        to_remove = [
            user_id for user_id, ctx in self.contexts.items()
            if datetime.fromisoformat(ctx.last_activity) < cutoff
        ]
        for user_id in to_remove:
            del self.contexts[user_id]
        self._save_contexts()
    
    def get_or_create_context(self, user_id: str) -> ConversationContext:
        """Récupère ou crée un contexte utilisateur"""
        if user_id not in self.contexts:
            self.contexts[user_id] = ConversationContext(user_id)
            self._save_contexts()
        return self.contexts[user_id]
    
    def get_user_profile(self, user_id: str) -> UserProfile:
        """Récupère ou crée un profil utilisateur"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = UserProfile(user_id)
            self._save_contexts()
        return self.user_profiles[user_id]
    
    async def process_message(self, user_id: str, message: str) -> Dict:
        """
        Traite un message utilisateur et renvoie une réponse
        
        Args:
            user_id: Identifiant unique de l'utilisateur
            message: Message de l'utilisateur
            
        Returns:
            Dictionnaire contenant la réponse et le contexte mis à jour
        """
        # Mettre à jour le profil utilisateur
        user_profile = self.get_user_profile(user_id)
        user_profile.last_active = datetime.utcnow()
        
        # Récupérer le contexte de conversation
        context = self.get_or_create_context(user_id)
        
        # Utiliser le nouveau chatbot pour générer une réponse
        chat_response = await self.chatbot.send_message(message)
        
        # Mettre à jour le contexte avec l'intention détectée (si disponible)
        context.current_intent = getattr(chat_response, 'intent', 'General_Chat')
        context.add_message("user", message, intent=context.current_intent)
        
        # Préparer la réponse au format attendu
        response = {
            "text": chat_response.response,
            "intent": context.current_intent,
            "confidence": getattr(chat_response, 'confidence', 1.0),
            "suggestions": getattr(chat_response, 'suggestions', []),
            "source": "generated"
        }
        
        # Ajouter la réponse au contexte
        context.add_message("assistant", response.get("text", ""), intent=context.current_intent)
        
        # Sauvegarder le contexte
        self._save_contexts()
        
        # Nettoyer les anciens contextes périodiquement
        if len(self.contexts) % 10 == 0:  # Tous les 10 messages
            self._cleanup_old_contexts()
        
        return {
            "response": response,
            "context": context.to_dict(),
            "user_profile": user_profile.to_dict()
        }
    
    def end_session(self, user_id: str):
        """Termine une session utilisateur"""
        if user_id in self.contexts:
            del self.contexts[user_id]
            self._save_contexts()
            return True
        return False

# Exemple d'utilisation
if __name__ == "__main__":
    async def test_dialogue_manager():
        # Initialisation
        manager = DialogueManager("data/context_memory.json")
        
        # Test de conversation
        test_messages = [
            "Bonjour, je suis un nouveau PNC",
            "Je cherche des conseils pour mon CV",
            "Je travaille pour Air France depuis 2 ans",
            "Merci pour ton aide !"
        ]
        
        user_id = "test_user_123"
        
        for message in test_messages:
            print(f"\nUtilisateur: {message}")
            response = await manager.process_message(user_id, message)
            print(f"Assistant: {response['response']['text']}")
            print(f"Intent détectée: {response['context']['current_intent']}")
        
        # Afficher le contexte final
        print("\nContexte final:")
        print(json.dumps(manager.get_or_create_context(user_id).to_dict(), 
                        indent=2, ensure_ascii=False))
        
        # Nettoyer
        manager.end_session(user_id)
    
    asyncio.run(test_dialogue_manager())