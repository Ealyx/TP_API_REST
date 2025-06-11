# TP_API_REST

TP Technologie Web Avancée : Création d'un API simple de type REST avec Node.JS avec un stockage de donnée dans une base de donnée SQL ou dans un fichier JSON.

Ce projet propose deux implémentations d'une API REST pour la gestion de super-héros :

- **api-superheros_JSON/** : API utilisant un fichier JSON comme stockage de données.
- **api-superheros_SQL/** : API utilisant une base de données SQLite.

## Prérequis

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- Pour l'API SQL : [sqlite3](https://www.sqlite.org/index.html) (installé via npm)

## Lancement de l'API

### API JSON

cd api-superheros_JSON
nmp start pour la lancer | nmp run dev pour la tester

### API SQL

cd api-superheros_SQL
nmp start pour la lancer | nmp run dev pour la tester

## Endpoints disponible

- GET /heroes : Liste tous les super-héros
- GET /heroes/:id : Récupère un super-héros par son ID
- POST /heroes : Ajoute un nouveau super-héros
- PUT /heroes/:id : Modifie un super-héros existant
- DELETE /heroes/:id : Supprime un super-héros

## Configuration

Les fichiers .env permettent de configurer les ports et autres variables d'environnement.

## Auteurs

LEPITRE Gauvain
