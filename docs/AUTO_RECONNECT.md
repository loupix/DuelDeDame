# Reconnexion Automatique des Parties

## Fonctionnalité

Le système de reconnexion automatique permet de reprendre une partie en cours après un rechargement de page ou une fermeture d'onglet.

## Comment ça marche

### 1. Sauvegarde de Session
- Quand un joueur rejoint une partie, la session est sauvegardée dans `sessionStorage`
- Les données incluent : `code`, `color`, `clientId`, `timestamp`

### 2. Détection au Chargement
- Au chargement de la page, le système vérifie s'il y a une partie en cours
- Si une session existe, elle est automatiquement restaurée

### 3. Reconnexion Socket
- Le système émet automatiquement `join` avec le `clientId` stocké
- Puis émet `ready` pour confirmer la connexion
- Gère les cas où le socket n'est pas encore connecté

## Test de la Fonctionnalité

### Scénario 1 : Rechargement de Page
1. Démarrer une partie (créer ou rejoindre)
2. Attendre que les deux joueurs soient connectés
3. Recharger la page (F5 ou Ctrl+R)
4. ✅ La partie devrait se reconnecter automatiquement

### Scénario 2 : Fermeture d'Onglet
1. Démarrer une partie
2. Fermer l'onglet
3. Rouvrir l'onglet sur la même URL
4. ✅ La partie devrait se reconnecter automatiquement

### Scénario 3 : Nouvel Onglet
1. Démarrer une partie dans un onglet
2. Ouvrir un nouvel onglet sur la même URL
3. ✅ Le nouvel onglet devrait se connecter à la même partie

## Indicateurs Visuels

### État de Reconnexion
- **Spinner bleu** : "Reconnexion à la partie..."
- **Spinner gris** : "En attente d'un adversaire..."
- **Texte vert** : "Les deux joueurs sont connectés"

### Logs Console
```
[SESSION] Récupération de la partie en cours: {code, color, clientId}
[WS][client][emit][join] {code, clientId}
[WS][client][emit][ready] {code}
```

## Gestion des Erreurs

### Session Corrompue
- Si les données de session sont invalides, elles sont supprimées
- L'utilisateur peut créer/rejoindre une nouvelle partie

### Socket Non Connecté
- Le système attend que le socket soit connecté
- Émet les événements dès que la connexion est établie

### Partie Expirée
- Les sessions de plus de 24h sont automatiquement nettoyées
- L'utilisateur est redirigé vers l'écran d'accueil

## Configuration

### Durée de Session
- **Session active** : 5 minutes
- **Partie en cours** : 24 heures
- **Nettoyage automatique** : Au démarrage de l'application

### Variables d'Environnement
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Dépannage

### La Reconnexion Ne Fonctionne Pas
1. Vérifier la console pour les erreurs
2. Vérifier que `sessionStorage` est disponible
3. Vérifier que le socket est connecté
4. Vérifier que l'API backend est démarrée

### Session Perdue
1. Vérifier que le navigateur accepte les cookies/sessionStorage
2. Vérifier qu'il n'y a pas de mode navigation privée
3. Vérifier les extensions de navigateur qui bloquent le stockage

### Socket Non Connecté
1. Vérifier que le serveur backend est démarré
2. Vérifier les variables d'environnement
3. Vérifier les ports (3000 pour frontend, 3001 pour backend)

## Commandes de Test

```bash
# Démarrer l'application complète
npm run dev:full

# Ou séparément
npm run dev:back  # Terminal 1
npm run dev:front # Terminal 2
```

## Logs de Debug

### Frontend
- `[SESSION]` : Gestion des sessions
- `[WS]` : Communication WebSocket
- `[SESSION_SYNC]` : Synchronisation entre onglets

### Backend
- `[DB]` : Opérations base de données
- `[WS]` : Événements WebSocket

## Améliorations Futures

- **Reconnexion intelligente** : Détecter les déconnexions réseau
- **Synchronisation temps réel** : Mise à jour instantanée entre onglets
- **Sauvegarde serveur** : Persistance côté serveur pour plus de robustesse
- **Notifications** : Alerter l'utilisateur des reconnexions