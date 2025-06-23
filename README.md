# Duel de Dame

Un jeu de dames moderne, jouable en ligne avec un ami, développé avec Next.js et TypeScript.

## 🎮 Fonctionnalités

- Plateau de jeu 8x8
- Pions blancs et noirs
- Déplacement des pièces
- Alternance des tours
- Jouable à deux en ligne (temps réel)
- Interface moderne et responsive

## 🚀 Installation

1. Clone le repository :
```bash
git clone [URL_DU_REPO]
cd duel-de-dame
```

2. Installe les dépendances :
```bash
npm install
```

3. Installe la dépendance serveur pour le multijoueur :
```bash
npm install socket.io
```

4. Lance le serveur Socket.IO (pour le mode en ligne) :
```bash
npm run start:server
```

5. Dans un autre terminal, lance le front Next.js :
```bash
npm run dev
```

6. Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## 👥 Jouer en ligne avec un ami

- Clique sur "Créer une partie" pour obtenir un code de partie.
- Envoie ce code à ton ami pour qu'il puisse rejoindre.
- Quand vous êtes deux, la partie commence et chaque coup est synchronisé en temps réel !

## 🛠️ Technologies utilisées

- Next.js 14
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