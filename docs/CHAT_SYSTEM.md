# Système de Chat - Duel de Dame

## Vue d'ensemble

Le système de chat permet aux joueurs de communiquer pendant leurs parties de dame. Il inclut des messages prédéfinis spécifiques au jeu de dame et des messages système automatiques.

## Fonctionnalités

### 1. Chat en temps réel
- Messages instantanés entre les joueurs
- Interface flottante non-intrusive
- Historique des messages avec horodatage
- Indicateur de nouveaux messages

### 2. Messages prédéfinis
Le système inclut des messages rapides spécialement conçus pour le jeu de dame :

#### Messages de base
- 👏 **Bonne partie !** - Pour féliciter l'adversaire
- 👍 **Bien joué !** - Pour complimenter un bon coup
- 🎯 **Belle prise !** - Pour une capture réussie
- 😅 **Oups...** - Pour un coup malheureux
- 🤔 **Je réfléchis...** - Pendant la réflexion
- 🍀 **Chanceux !** - Pour un coup chanceux
- 🎉 **Bien joué !** - Félicitations générales
- 😤 **Presque !** - Pour un coup qui manque de peu
- 💪 **Allez !** - Pour encourager
- 🏆 **GG !** - Good Game
- 🔄 **Revanche ?** - Proposer une nouvelle partie
- 🍀 **Bonne chance !** - Souhaiter bonne chance

#### Messages avancés
- ♟️ **Échec et mat !** - Pour une victoire
- 🤝 **Pat !** - Pour une partie nulle
- 🏳️ **Je passe !** - Pour abandonner
- ⏰ **Pression temporelle !** - Pour le stress temporel

### 3. Messages système automatiques
- **Connexion** : "Blanc/Noir a rejoint la partie"
- **Changement de tour** : "C'est au tour de Blanc/Noir"
- **Déconnexion** : Gestion automatique des déconnexions

### 4. Interface utilisateur
- **Bouton flottant** : Icône de chat en bas à droite
- **Badge de notification** : Nombre de messages non lus
- **Interface extensible** : Chat qui s'ouvre/ferme
- **Messages prédéfinis** : Bouton ⚡ pour accéder aux messages rapides
- **Saisie libre** : Possibilité d'écrire des messages personnalisés

## Architecture technique

### Frontend (React/TypeScript)

#### Composant Chat (`src/components/game/Chat.tsx`)
- Interface utilisateur du chat
- Gestion des messages prédéfinis
- Communication WebSocket
- Auto-scroll vers les nouveaux messages

#### Service ChatService (`src/services/ChatService.ts`)
- Gestion centralisée des messages
- Configuration du chat
- Sons de notification
- Messages prédéfinis et système

### Backend (NestJS/WebSocket)

#### GameGateway (`api/src/game.gateway.ts`)
- Gestion des messages de chat via WebSocket
- Validation des messages
- Diffusion aux joueurs de la partie
- Messages système automatiques

## Utilisation

### Pour les joueurs
1. **Ouvrir le chat** : Cliquer sur l'icône de chat en bas à droite
2. **Messages prédéfinis** : Cliquer sur ⚡ pour voir les messages rapides
3. **Message personnalisé** : Taper dans le champ de saisie et appuyer sur Entrée
4. **Fermer le chat** : Cliquer sur la croix ou sur l'icône de chat

### Messages système
Les messages système apparaissent automatiquement pour :
- L'arrivée d'un joueur
- Le changement de tour
- Les événements de partie

## Configuration

### ChatService
```typescript
const config = {
  maxMessages: 100,      // Nombre max de messages en mémoire
  autoScroll: true,      // Auto-scroll vers les nouveaux messages
  soundEnabled: true     // Sons de notification
}
```

### Messages prédéfinis
Les messages peuvent être personnalisés dans `ChatService.getPredefinedMessages()`

## Sécurité

- Validation des messages côté serveur
- Vérification que le joueur fait partie de la partie
- Limitation de la taille des messages
- Protection contre le spam

## Extensions possibles

1. **Modération** : Système de modération des messages
2. **Émojis** : Palette d'émojis intégrée
3. **Historique** : Sauvegarde des conversations
4. **Thèmes** : Personnalisation de l'apparence
5. **Langues** : Support multilingue
6. **Messages privés** : Chat privé entre joueurs
7. **Statistiques** : Compteurs de messages par joueur

## Intégration

Le chat est automatiquement intégré dans le composant `Game` et fonctionne avec le système WebSocket existant. Aucune configuration supplémentaire n'est nécessaire.