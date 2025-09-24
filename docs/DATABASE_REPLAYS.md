# Système de Replays avec Base de Données

## Vue d'ensemble

Le système de replays a été étendu pour inclure une persistance en base de données côté serveur. Chaque mouvement est maintenant automatiquement enregistré dans une base de données SQLite, permettant de récupérer et rejouer n'importe quelle partie.

## Architecture

### Base de Données (SQLite)

#### Table `games`
- **id**: Identifiant unique de la partie
- **code**: Code de la partie (6 caractères)
- **status**: Statut ('waiting', 'active', 'finished')
- **winner**: Gagnant ('white', 'black', null)
- **currentTurn**: Tour actuel ('white', 'black')
- **moveCount**: Nombre de coups joués
- **duration**: Durée en secondes
- **whitePlayerId/blackPlayerId**: Identifiants des joueurs
- **whitePlayerName/blackPlayerName**: Noms des joueurs
- **createdAt/updatedAt**: Timestamps

#### Table `moves`
- **id**: Identifiant unique du mouvement
- **gameId**: Référence vers la partie
- **player**: Joueur ('white', 'black')
- **fromX/fromY**: Position de départ
- **toX/toY**: Position d'arrivée
- **piece**: Type de pièce
- **isCapture**: Capture effectuée
- **isPromotion**: Promotion effectuée
- **moveNumber**: Numéro du coup
- **notation**: Notation algébrique
- **timestamp**: Timestamp du mouvement

### API Endpoints

#### GET `/api/games/replay/:code`
Récupère un replay complet d'une partie par son code.

**Réponse:**
```json
{
  "success": true,
  "data": {
    "game": { ... },
    "moves": [ ... ]
  }
}
```

#### GET `/api/games/recent?limit=10`
Récupère les parties récentes.

#### GET `/api/games/player/:playerId?limit=10`
Récupère les parties d'un joueur spécifique.

#### GET `/api/games/stats`
Récupère les statistiques globales.

### Services Frontend

#### ReplayService
Service pour interagir avec l'API de replays :
- `getGameReplay(code)`: Récupère un replay
- `getRecentGames(limit)`: Parties récentes
- `getPlayerGames(playerId, limit)`: Parties d'un joueur
- `getGameStats()`: Statistiques globales

## Fonctionnalités

### Enregistrement Automatique
- **Création de partie**: Automatique lors du premier `join`
- **Ajout de joueurs**: Enregistrement des clientId et couleurs
- **Mouvements**: Chaque coup est enregistré avec métadonnées
- **Fin de partie**: Statut et gagnant enregistrés

### Replays
- **Récupération par code**: Accès direct via le code de partie
- **Historique complet**: Tous les mouvements avec timestamps
- **Métadonnées**: Durée, nombre de coups, joueurs
- **Notation algébrique**: Format standard pour les coups

### Interface Utilisateur
- **Page `/replays-db`**: Interface pour consulter les replays
- **Liste des parties**: Parties récentes avec informations
- **Détails du replay**: Mouvements détaillés avec notation
- **Statut API**: Indicateur de connexion au serveur

## Utilisation

### Démarrage du Système

1. **Initialiser la base de données:**
   ```bash
   npm run init-db
   ```

2. **Démarrer l'application complète:**
   ```bash
   npm run dev:full
   ```

3. **Ou démarrer séparément:**
   ```bash
   # Terminal 1 - API
   npm run dev:back
   
   # Terminal 2 - Frontend
   npm run dev:front
   ```

### Accès aux Replays

1. **Via l'interface web:**
   - Aller sur `/replays-db`
   - Sélectionner une partie dans la liste
   - Consulter les détails et mouvements

2. **Via l'API directement:**
   ```bash
   curl http://localhost:3001/api/games/replay/ABC123
   ```

### Configuration

#### Variables d'environnement
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
NEST_PORT=3001
NEST_CORS_ORIGIN=http://localhost:3000
```

## Avantages

### Persistance
- **Données permanentes**: Les parties ne sont pas perdues
- **Historique complet**: Accès à toutes les parties jouées
- **Métadonnées riches**: Informations détaillées sur chaque partie

### Performance
- **Requêtes optimisées**: Index sur les codes de partie
- **Pagination**: Limitation des résultats pour les performances
- **Cache**: Possibilité d'ajouter un cache Redis

### Évolutivité
- **Migration facile**: Passage à PostgreSQL/MySQL
- **API RESTful**: Interface standard pour les intégrations
- **Microservices**: Séparation claire frontend/backend

## Sécurité

### Validation
- **Données d'entrée**: Validation des mouvements
- **Authentification**: Possibilité d'ajouter l'auth
- **Rate limiting**: Protection contre les abus

### Nettoyage
- **Parties expirées**: Suppression automatique des parties anciennes
- **Limite de stockage**: Rotation des données anciennes

## Évolutions Futures

### Fonctionnalités Avancées
- **Analyse de parties**: Détection d'erreurs et suggestions
- **Classements**: Système de points et classements
- **Tournois**: Organisation de compétitions
- **Streaming**: Diffusion de parties en direct

### Intégrations
- **Export PGN**: Format standard d'échange
- **Import de parties**: Chargement de parties externes
- **API publique**: Accès pour développeurs tiers
- **Mobile**: Application mobile native

### Performance
- **Cache Redis**: Mise en cache des parties fréquentes
- **CDN**: Distribution des assets statiques
- **Load balancing**: Répartition de charge
- **Monitoring**: Surveillance des performances