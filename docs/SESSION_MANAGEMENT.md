# Gestion des Sessions et Persistance des Parties

## Vue d'ensemble

Le système de gestion des sessions a été amélioré pour permettre :
- L'enregistrement automatique de chaque partie jouée
- La persistance des sessions entre rechargements d'onglets
- La synchronisation des clientId entre onglets
- La récupération des parties en cours après interruption

## Fonctionnalités Implémentées

### 1. Enregistrement Automatique des Parties

**Service :** `GameDataService`
- Chaque partie est automatiquement enregistrée dès qu'elle commence
- Tous les coups sont sauvegardés en temps réel
- Les statistiques sont mises à jour automatiquement
- Les parties sont stockées dans `localStorage` pour la persistance

**Données enregistrées :**
- Code de la partie
- Couleur du joueur
- Tous les coups avec timestamps
- Durée de la partie
- Résultat (victoire/défaite/nul)
- Métadonnées (captures, promotions, etc.)

### 2. Gestion des Sessions

**Service :** `SessionSyncService`
- Synchronisation des clientId entre onglets
- Gestion des sessions de jeu partagées
- Nettoyage automatique des sessions expirées
- Communication inter-onglets via `localStorage` et `sessionStorage`

**Persistance :**
- `localStorage` : Données permanentes (clientId, statistiques, historique)
- `sessionStorage` : Données temporaires (partie en cours, session active)

### 3. Récupération des Parties

**Fonctionnalités :**
- Récupération automatique après rechargement de page
- Continuité de session entre onglets
- Détection des parties interrompues
- Nettoyage des sessions expirées (24h max)

## Architecture Technique

### Services Principaux

#### GameDataService
```typescript
// Méthodes principales
startGame(code: string, color: 'white' | 'black'): void
recordMove(from, to, player, piece, capture?, promotion?): void
endGame(result: 'win' | 'loss' | 'draw', opponent: string): void
loadCurrentGame(): GameData | null
getCurrentGameInfo(): GameInfo | null
```

#### SessionSyncService
```typescript
// Méthodes principales
syncClientId(clientId: string): void
syncGameSession(gameData: any): void
subscribe(event: string, callback: Function): () => void
hasActiveGameSession(): boolean
cleanupExpiredSessions(): void
```

### Composants

#### CurrentGameInfo
- Affiche les informations de la partie en cours
- Mise à jour en temps réel
- Indicateurs visuels (couleur, nombre de coups, durée)

## Utilisation

### Pour l'Utilisateur

1. **Démarrage d'une partie :**
   - La partie est automatiquement sauvegardée
   - Les informations apparaissent dans le composant `CurrentGameInfo`

2. **Rechargement de page :**
   - La session est automatiquement récupérée
   - La partie continue là où elle s'était arrêtée

3. **Ouverture d'un nouvel onglet :**
   - Le clientId est synchronisé
   - La session de jeu est partagée

4. **Fermeture d'onglet :**
   - La session est marquée comme fermée
   - Nettoyage automatique après expiration

### Pour le Développeur

#### Ajout d'une nouvelle donnée à persister :
```typescript
// Dans GameDataService
private saveCurrentGame(): void {
  const gameData = {
    ...this.currentGame,
    newField: newValue,
    lastSaved: Date.now()
  }
  sessionStorage.setItem('currentGameData', JSON.stringify(gameData))
}
```

#### Synchronisation d'un nouvel événement :
```typescript
// Dans SessionSyncService
subscribe('newEvent', (data) => {
  // Traitement de l'événement
})
```

## Sécurité et Performance

### Sécurité
- Validation des données avant sauvegarde
- Nettoyage automatique des sessions expirées
- Gestion des erreurs de parsing JSON

### Performance
- Sauvegarde différée (après chaque coup)
- Limitation de l'historique (100 parties max)
- Nettoyage périodique des données obsolètes

## Configuration

### Durées de Rétention
- Sessions actives : 5 minutes
- Parties en cours : 24 heures
- Historique complet : Illimité (avec limite de 100 parties)

### Stockage
- `localStorage` : Persistant entre sessions
- `sessionStorage` : Temporaire, effacé à la fermeture du navigateur

## Dépannage

### Problèmes Courants

1. **Session perdue après rechargement :**
   - Vérifier que `sessionStorage` est disponible
   - Contrôler les erreurs de parsing JSON

2. **Synchronisation entre onglets ne fonctionne pas :**
   - Vérifier les permissions de `localStorage`
   - Contrôler les événements `storage`

3. **Partie non récupérée :**
   - Vérifier l'âge de la session (max 24h)
   - Contrôler la cohérence des données

### Logs de Debug
- `[SESSION]` : Gestion des sessions
- `[SESSION_SYNC]` : Synchronisation entre onglets
- `[GAME]` : Récupération des parties
- `[WS]` : Communication WebSocket

## Évolutions Futures

### Améliorations Possibles
- Sauvegarde sur serveur pour persistance cross-device
- Historique des parties avec analyse
- Système de sauvegarde automatique en arrière-plan
- Export/import des parties
- Système de notifications pour les parties en attente