"""
Test de conversation avec le DialogueManager
"""
import asyncio
import sys
import os

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chatbot.dialogue_manager import DialogueManager

async def test_conversation():
    """Teste une conversation complète avec le DialogueManager"""
    print("\n🤖 Test de conversation avec DialogueManager")
    print("====================================")
    
    # Initialiser le gestionnaire de dialogue
    dm = DialogueManager()
    user_id = "test_user_123"
    
    # Liste des messages de test
    test_messages = [
        "Bonjour, je cherche des conseils pour devenir hôtesse de l'air",
        "Quelles sont les formations nécessaires ?",
        "Et pour travailler chez Air France ?"
    ]
    
    # Simuler une conversation
    for i, message in enumerate(test_messages, 1):
        print(f"\n💬 Tour de conversation {i}")
        print(f"👤 Vous: {message}")
        
        # Traiter le message
        response = await dm.process_message(user_id, message)
        
        # Afficher la réponse
        print(f"🤖 Assistant: {response.get('response')}")
        print(f"   - Intention: {response.get('intent', {}).get('name', 'inconnue')}")
        print(f"   - Confiance: {response.get('intent', {}).get('confidence', 0):.2f}")
        
        # Petite pause pour la lisibilité
        if i < len(test_messages):
            print("\n⏳ En attente du prochain message...")
            await asyncio.sleep(1)
    
    print("\n✅ Test de conversation terminé avec succès !")

if __name__ == "__main__":
    print("🔍 Démarrage du test de conversation...")
    asyncio.run(test_conversation())
