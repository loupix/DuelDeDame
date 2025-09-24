# Guide de Résolution des Problèmes

## Problèmes de Build

### 1. Avertissements Webpack SWC

**Symptôme :**
```
<w> [webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo] Managed item ... isn't a directory or doesn't contain a package.json
```

**Solution :**
Ces avertissements sont normaux et n'affectent pas le fonctionnement. Ils concernent les binaires SWC pour différentes plateformes. La configuration `next.config.js` les ignore automatiquement.

### 2. Erreur Google Fonts

**Symptôme :**
```
request to https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap failed
```

**Solution :**
- Utiliser des polices système au lieu de Google Fonts
- Configuration Tailwind avec polices système robustes
- Pas de dépendance réseau externe

### 3. Erreur Module 'critters'

**Symptôme :**
```
Error: Cannot find module 'critters'
```

**Solution :**
- Désactiver l'optimisation CSS expérimentale
- Configuration Next.js simplifiée
- Éviter les dépendances optionnelles problématiques

### 4. Conflits de Dépendances

**Symptôme :**
```
npm ERR! ERESOLVE could not resolve
```

**Solution :**
```bash
# Nettoyer et réinstaller
npm run clean:install

# Ou forcer l'installation
npm install --legacy-peer-deps
```

## Problèmes de Base de Données

### 1. Base de Données Non Initialisée

**Symptôme :**
```
Error: no such table: games
```

**Solution :**
```bash
npm run init-db
```

### 2. Connexion API Échouée

**Symptôme :**
```
L'API n'est pas disponible
```

**Solution :**
1. Vérifier que l'API est démarrée :
   ```bash
   npm run dev:back
   ```

2. Vérifier les variables d'environnement :
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEST_PORT=3001
   ```

3. Vérifier les ports disponibles :
   ```bash
   netstat -an | findstr :3001
   ```

## Problèmes de Session

### 1. Sessions Perdues

**Symptôme :**
Parties perdues après rechargement

**Solution :**
- Vérifier que `sessionStorage` est disponible
- Contrôler les erreurs de parsing JSON
- Vérifier la cohérence des données

### 2. Synchronisation Entre Onglets

**Symptôme :**
ClientId non synchronisé

**Solution :**
- Vérifier les permissions de `localStorage`
- Contrôler les événements `storage`
- Redémarrer les onglets

## Problèmes de Performance

### 1. Build Lent

**Solution :**
```bash
# Nettoyer le cache
npm run clean

# Build optimisé
npm run build:clean
```

### 2. Rechargement Lent

**Solution :**
- Utiliser le mode développement optimisé
- Vérifier les imports inutiles
- Optimiser les composants React

## Commandes Utiles

### Nettoyage
```bash
# Nettoyer tout
npm run clean

# Nettoyer et réinstaller
npm run clean:install

# Build propre
npm run build:clean
```

### Développement
```bash
# Développement complet
npm run dev:full

# Frontend seulement
npm run dev:front

# Backend seulement
npm run dev:back
```

### Base de Données
```bash
# Initialiser la BDD
npm run init-db

# Vérifier la BDD
ls -la api/games.db
```

## Logs de Debug

### Frontend
- `[SESSION]` : Gestion des sessions
- `[SESSION_SYNC]` : Synchronisation entre onglets
- `[GAME]` : Récupération des parties
- `[WS]` : Communication WebSocket

### Backend
- `[DB]` : Opérations base de données
- `[WS]` : Événements WebSocket
- `[API]` : Requêtes API

## Vérifications Système

### 1. Ports Disponibles
```bash
# Windows
netstat -an | findstr :3000
netstat -an | findstr :3001

# Linux/Mac
lsof -i :3000
lsof -i :3001
```

### 2. Variables d'Environnement
```bash
# Vérifier les variables
echo $NEXT_PUBLIC_API_URL
echo $NEST_PORT
```

### 3. Fichiers de Base de Données
```bash
# Vérifier l'existence
ls -la api/games.db

# Vérifier les permissions
chmod 644 api/games.db
```

## Support

### Logs Détaillés
```bash
# Mode debug
DEBUG=* npm run dev

# Logs spécifiques
DEBUG=duel-de-dame:* npm run dev
```

### Vérification Complète
```bash
# Test complet
npm run clean:install
npm run init-db
npm run dev:full
```

### Reset Complet
```bash
# Supprimer tout et recommencer
rm -rf node_modules
rm -rf .next
rm -rf api/dist
rm -f api/games.db
npm install
npm run init-db
npm run dev:full
```