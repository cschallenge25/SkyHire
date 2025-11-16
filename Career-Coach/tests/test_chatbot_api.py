"""
Test d'intégration avec l'API du chatbot
"""
import asyncio
import httpx
from dotenv import load_dotenv
import os
import sys

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()
async def test_chatbot():
    """Teste l'endpoint de chat de l'API"""
    url = "http://localhost:8000/api/v1/chat"
    headers = {"Content-Type": "application/json"}
    
    # Test avec une question sur le secteur aéronautique
    payload = {
        "user_id": "test_user_123",
        "message": "Quelles sont les compétences nécessaires pour devenir PNC ?",
        "session_id": "test_session_001"
    }
    
    try:
        print("\n🚀 Test de l'API Chatbot")
        print("======================")
        async with httpx.AsyncClient() as client:
            print(f"📤 Envoi de la requête à {url}")
            print(f"💬 Message: {payload['message']}")
            
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        
        # Afficher la réponse brute pour le débogage
        print(f"\n📡 Réponse brute: {response.text}")
        
        response.raise_for_status()
        data = response.json()
        
        print("\n✅ Réponse du serveur :")
        print(f"📝 Message: {data.get('text', 'Pas de réponse')}")
        print(f"💡 Intent: {data.get('intent', 'inconnue')}")
        print(f"🎯 Confidence: {data.get('confidence', 0) or 0:.2f}")
        if data.get('suggestions'):
            print(f"💡 Suggestions: {', '.join(data['suggestions'])}")
        metadata = data.get('metadata', {})
        print(f"⏱️  Timestamp: {metadata.get('timestamp', 'N/A')}")
        print(f"📍 Source: {metadata.get('response_source', 'N/A')}")
            
    except Exception as e:
        print(f"\n❌ Erreur lors de l'appel API: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"Détails de l'erreur: {e.response.text}")


if __name__ == "__main__":
    print("🔍 Démarrage du test d'API...")
    asyncio.run(test_chatbot())
