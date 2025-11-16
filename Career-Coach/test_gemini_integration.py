"""
Script de test pour vérifier l'intégration avec l'API Gemini (SkyHire Project)
Auteur : Raef Gaied
"""

import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# =========================
# 🔧 Chargement de l'environnement
# =========================
# Charge le fichier .env (même dossier que ce script)
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

def test_gemini_connection():
    """Teste la connexion à l'API Gemini et la génération de texte"""
    try:
        # 🔍 Étape 1 : Vérifier la clé API
        api_key = os.getenv("GEMINI_API_KEY")
        print(f"📂 Répertoire de travail : {os.getcwd()}")
        print(f"🧩 Fichier .env chargé depuis : {dotenv_path}")

        if not api_key or api_key.strip() == "":
            print("❌ ERREUR : Aucune clé API détectée dans le fichier .env")
            print("👉 Vérifie que ton .env contient : GEMINI_API_KEY=\"ta_cle_api\"")
            return False

        print("🔑 Clé API détectée !")

        # 🔧 Étape 2 : Configurer le client Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        # 🧠 Étape 3 : Effectuer un test simple
        prompt = "Dis-moi bonjour en français dans une phrase polie."
        print(f"🧠 Envoi du prompt de test : {prompt}")
        response = model.generate_content(prompt)

        if response and hasattr(response, "text"):
            print(f"✅ Réponse reçue : {response.text.strip()[:120]}...")
            return True
        else:
            print("❌ Aucune réponse valide reçue de l'API Gemini.")
            return False

    except Exception as e:
        print(f"❌ Erreur lors de la connexion à l'API Gemini : {str(e)}")
        return False


if __name__ == "__main__":
    print("🔍 Lancement du test d'intégration avec l'API Gemini...\n")

    if test_gemini_connection():
        print("\n🎉 Test réussi ! L'intégration avec Gemini est fonctionnelle ✅")
        print("Tu peux maintenant utiliser le chatbot intelligent SkyHire 🤖.")
    else:
        print("\n⚠️ Test échoué !")
        print("Vérifie les points suivants :")
        print("1️⃣ Le fichier .env contient bien GEMINI_API_KEY=\"ta_cle_api\"")
        print("2️⃣ Le chemin du .env est correct")
        print("3️⃣ Ta connexion Internet est active")
        sys.exit(1)
