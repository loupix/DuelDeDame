# Test du système de partage d'URL

## Fonctionnalités implémentées

### 1. Variables d'environnement
- `NEXT_PUBLIC_BASE_URL` : URL de base pour le partage
- `NEXT_PUBLIC_DOMAIN` : Nom de domaine pour les URLs

### 2. API Backend
- **GameEntity** : Entité pour stocker les parties en base
- **GameService** : Service pour gérer les parties (création, mise à jour, suppression)
- **GameController** : Contrôleur avec routes REST
  - `GET /game/info/:code` : Infos d'une partie
  - `POST /game/create` : Créer une partie
  - `GET /game/join/:code` : Rejoindre une partie

### 3. Frontend
- **Route spéciale** : `/join/[code]` pour rejoindre une partie via URL
- **ShareButton** : Composant pour partager l'URL
  - Bouton de partage natif (Web Share API)
  - Bouton de copie d'URL
  - Affichage de l'URL complète
- **Intégration** : Bouton ajouté dans la page principale

### 4. Base de données
- Table `games` avec :
  - code (unique)
  - status (waiting/playing/finished)
  - playerCount
  - name, description
  - timestamps

## Comment tester

1. **Démarrer le projet** :
   ```bash
   npm run dev
   ```

2. **Créer une partie** :
   - Aller sur http://localhost:3000
   - Cliquer sur "Créer une partie"
   - Le bouton "Partager l'URL" apparaît

3. **Partager l'URL** :
   - Cliquer sur "Partager l'URL"
   - L'URL sera copiée dans le presse-papiers
   - Format : `http://localhost:3000/join/ABC123`

4. **Rejoindre via URL** :
   - Ouvrir l'URL partagée dans un nouvel onglet
   - Le joueur rejoint automatiquement la partie

5. **Vérifier la base de données** :
   - Les parties sont stockées en base
   - Le statut est mis à jour en temps réel

## URLs générées

- **Format** : `{NEXT_PUBLIC_BASE_URL}/join/{code}`
- **Exemple** : `http://localhost:3000/join/ABC123`
- **En production** : `https://duel-de-dame.com/join/ABC123`

## Améliorations possibles

1. **QR Code** : Générer un QR code pour l'URL
2. **Partage social** : Intégration avec réseaux sociaux
3. **Statistiques** : Compter les parties créées/partagées
4. **Parties privées** : Système de mots de passe
5. **Expiration** : Parties qui expirent après X temps