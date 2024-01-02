# Test Technique - NONAM

Ce projet Node.js utilise Docker, l'API Pappers et un webhook de webhook.site pour récupérer et traiter des informations sur des entreprises françaises.

## Prérequis
- Docker
- Compte Pappers (https://www.pappers.fr/mon-compte/api)
- URL webhook.site

## Fonctionnalités
- **GET `/entreprise/:siren`** : Récupère les informations d'une entreprise française via son numéro SIREN et envoie les données à un webhook.
- **GET `/jobs`** : Affiche l'état des jobs en cours.

## Installation et Exécution
1. Clonez le dépôt.
2. Ajoutez le fichier .env
3. Construisez l'image Docker et lancez le conteneur.
4. Utilisez les endpoints fournis pour interagir avec l'application.
