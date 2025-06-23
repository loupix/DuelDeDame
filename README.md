# Duel de Dame

Un jeu de dames moderne, jouable en ligne avec un ami, développé avec Next.js (front) et NestJS (API temps réel) en TypeScript.

## 🎮 Fonctionnalités

- Plateau de jeu 8x8
- Pions blancs et noirs
- Déplacement des pièces
- Alternance des tours
- Jouable à deux en ligne (temps réel)
- Interface moderne et responsive

## 🚀 Installation & Lancement

1. **Clone le repository :**
```bash
git clone [URL_DU_REPO]
cd duel-de-dame
```

2. **Installe toutes les dépendances :**
```bash
npm install
```

3. **Configure les variables d'environnement :**
Crée un fichier `.env` à la racine (voir exemple plus bas).

4. **Lance le projet en mode développement (front + back) :**
```bash
npm run dev
```
- Le front Next.js sera dispo sur [http://localhost:3000](http://localhost:3000)
- L'API temps réel NestJS (Socket.IO) tournera sur [http://localhost:3001](http://localhost:3001)

### Scripts utiles
- `npm run dev:front` : Lance uniquement le front Next.js
- `npm run dev:back` : Lance uniquement le backend NestJS (API temps réel)
- `npm run build` : Build front + back pour la prod
- `npm run start:front` : Démarre le front Next.js en mode prod
- `npm run start:back` : Démarre l'API NestJS en mode prod

## ⚙️ Variables d'environnement
Exemple de `.env` à la racine :
```
# --- Backend ---
NEST_PORT=3001
NEST_CORS_ORIGIN=http://localhost:3000

# --- Frontend ---
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 👥 Jouer en ligne avec un ami

- Clique sur "Créer une partie" pour obtenir un code de partie.
- Envoie ce code à ton ami pour qu'il puisse rejoindre.
- Quand vous êtes deux, la partie commence et chaque coup est synchronisé en temps réel !

## 🛠️ Technologies utilisées

- Next.js 14 (frontend)
- NestJS 11 (backend temps réel)
- TypeScript
- Tailwind CSS
- Socket.IO (temps réel)
- Design Patterns (MVC, Observer, Factory, Strategy)

## 🎯 Règles du jeu

1. Les pions se déplacent uniquement en diagonale vers l'avant
2. Les pions peuvent capturer les pièces adverses en sautant par-dessus
3. Un pion qui atteint la dernière rangée devient une dame
4. Les dames peuvent se déplacer en diagonale sur n'importe quelle distance
5. Le joueur qui capture toutes les pièces adverses gagne

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésite pas à :
1. Fork le projet
2. Créer une branche pour ta fonctionnalité
3. Commiter tes changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.