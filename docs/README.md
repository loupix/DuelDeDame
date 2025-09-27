# Documentation Duel de Dame

Bienvenue dans la documentation du projet Duel de Dame, un jeu de dames moderne développé avec Next.js et NestJS.

## 📁 Structure de la documentation

- **[TESTS.md](./TESTS.md)** - Documentation complète des tests de l'API
- **[FEATURES.md](./FEATURES.md)** - Liste des fonctionnalités du jeu
- **[CHAT_SYSTEM.md](./CHAT_SYSTEM.md)** - Système de chat en temps réel
- **[STYLE.md](./STYLE.md)** - Guide de style et conventions

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd DuelDeDame

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Commandes disponibles
```bash
# Développement
npm run dev              # Front + Back + API
npm run dev:front        # Front uniquement
npm run dev:back         # Back uniquement

# Build
npm run build            # Build complet
npm run build:front      # Build front
npm run build:back       # Build back

# Tests
npm run test             # Tous les tests
npm run test:back        # Tests API uniquement
npm run test:front       # Tests front (à venir)

# Base de données
npm run db:reset         # Reset base de données
npm run db:backup        # Sauvegarde base
npm run db:info          # Info base de données
```

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework :** Next.js 14 avec App Router
- **Styling :** Tailwind CSS
- **État :** React Hooks + Context
- **WebSocket :** Socket.io-client

### Backend (NestJS)
- **Framework :** NestJS avec TypeScript
- **Base de données :** SQLite avec TypeORM
- **WebSocket :** Socket.io
- **API :** REST + WebSocket

### Fonctionnalités principales
- 🎮 Jeu de dames en temps réel
- 👥 Multi-joueur via WebSocket
- 💬 Chat intégré
- 📊 Statistiques et replays
- 🌍 Géolocalisation IP
- 🔐 Sessions utilisateur persistantes

## 📊 Tests

Le projet inclut une suite de tests complète :

- **Tests unitaires :** Services et logique métier
- **Tests d'intégration :** Endpoints API complets
- **Base de données :** SQLite en mémoire pour les tests
- **Couverture :** 13 tests couvrant tous les services

Voir [TESTS.md](./TESTS.md) pour la documentation détaillée.

## 🎯 Fonctionnalités

### Jeu
- Plateau de dames 10x10
- Règles classiques des dames
- Interface moderne et responsive
- Effets visuels et sonores

### Multi-joueur
- Connexion par code de partie
- Synchronisation temps réel
- Gestion des déconnexions
- Chat intégré

### Persistance
- Sessions utilisateur avec identité
- Historique des parties
- Statistiques détaillées
- Replays des parties

### Géolocalisation
- Détection automatique du pays
- Fuseau horaire local
- Langue détectée
- Enrichissement des profils

## 🔧 Développement

### Structure du projet
```
DuelDeDame/
├── src/                    # Frontend Next.js
│   ├── app/               # Pages et layouts
│   ├── components/        # Composants React
│   ├── services/          # Services frontend
│   └── models/            # Modèles de données
├── api/                   # Backend NestJS
│   ├── src/               # Code source API
│   └── test/              # Tests API
├── docs/                  # Documentation
└── public/                # Assets statiques
```

### Conventions
- **TypeScript** strict
- **ESLint** + **Prettier** pour le formatage
- **Tests** obligatoires pour les nouvelles fonctionnalités
- **Commits** en français avec préfixes

### Ajout de fonctionnalités
1. Créer la branche feature
2. Développer avec tests
3. Documenter les changements
4. Créer une PR

## 📝 Changelog

### v0.1.0 - Session utilisateur et tests
- ✅ Système de session avec identité enrichie
- ✅ Géolocalisation IP automatique
- ✅ Persistance des matchs en base
- ✅ Navbar avec menu des matchs
- ✅ Suite de tests complète (13 tests)
- ✅ Documentation des tests

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Développer avec tests
4. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](../LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Consulter la documentation
- Vérifier les tests existants