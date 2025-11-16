"""
Test d'intégration complet du système de chatbot
"""
import asyncio
import sys
import os

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chatbot.dialogue_manager import DialogueManager
from chatbot.intent_classifier import CareerCoachChatbot
from chatbot.response_generator import ResponseGenerator

async def test_end_to_end():
    """Teste l'intégration complète des composants du chatbot"""
    print("\n🚀 Test d'intégration complet du chatbot")
    print("==================================")
    
    # Initialiser les composants
    print("🔧 Initialisation des composants...")
    chatbot = CareerCoachChatbot(use_gemini=True)
    response_generator = ResponseGenerator(
        os.path.join(os.path.dirname(__file__), "..", "data", "chatbot_faq.json")
    )
    dialogue_manager = DialogueManager()
    
    # Configuration du test
    user_id = "test_user_123"
    test_messages = [
        "Bonjour, je m'intéresse à une carrière dans l'aéronautique",
        "Quelles sont les compétences requises pour devenir PNC ?",
        "Merci pour ces informations !"
    ]
    
    # Exécuter la conversation de test
    for i, message in enumerate(test_messages, 1):
        print(f"\n🔵 Tour de test {i}")
        print(f"👤 Message: {message}")
        
        # Étape 1: Générer une réponse avec le chatbot
        response = await chatbot.send_message(message)
        print(f"🤖 Réponse générée: {response.response}")
        print(f"🎯 Intention détectée: {getattr(response, 'intent', 'inconnue')} (confiance: {getattr(response, 'confidence', 0):.2f})")
        
        # Étape 2: Récupération du contexte
        context = await dialogue_manager.get_context(user_id)
        
        # Étape 3: Génération de la réponse
        response = await response_generator.generate_response(
            message, 
            getattr(response, 'intent', 'General_Chat'), 
            context
        )
        
        # Afficher la réponse
        print(f"🤖 Réponse: {response.response}")
        
        # Étape 4: Mise à jour du contexte
        await dialogue_manager.update_context(user_id, message, response)
        print("✅ Contexte mis à jour")
    
    print("\n🎉 Test d'intégration terminé avec succès !")

if __name__ == "__main__":
    print("🔍 Démarrage du test d'intégration...")
    asyncio.run(test_end_to_end())
