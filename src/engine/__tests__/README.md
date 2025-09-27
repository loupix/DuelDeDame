# Tests du système d'IA

Ce dossier contient tous les tests pour le système d'intelligence artificielle du jeu de dames.

## Structure des tests

```
__tests__/
├── strategies/           # Tests des stratégies IA
│   ├── RandomEngineStrategy.test.ts
│   ├── HeuristicEngineStrategy.test.ts
│   └── MinimaxEngineStrategy.test.ts
├── factories/           # Tests des factories
│   └── EngineStrategyFactory.test.ts
├── EnginePlayer.test.ts # Tests du joueur IA
├── EngineGameService.test.ts # Tests du service de jeu
├── integration/         # Tests d'intégration
│   └── EngineIntegration.test.ts
├── setup.ts            # Configuration des tests
└── README.md           # Ce fichier
```

## Exécution des tests

```bash
# Tous les tests
npm test

# Tests spécifiques à l'IA
npm test -- --testPathPattern=engine

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm test -- --watch
```

## Types de tests

### Tests unitaires
- **Stratégies** : Vérification des algorithmes IA
- **Factory** : Création des stratégies
- **EnginePlayer** : Comportement du joueur IA
- **EngineGameService** : Gestion des parties

### Tests d'intégration
- **Service complet** : Parties entières contre l'IA
- **Performance** : Temps de réponse des algorithmes
- **Gestion d'erreurs** : Robustesse du système

## Couverture de code

Les tests visent une couverture de code élevée pour :
- Toutes les stratégies IA
- Tous les cas d'usage
- Gestion des erreurs
- Performance

## Notes importantes

- Les tests utilisent des timers mockés pour les délais de réflexion
- Les tests d'intégration peuvent prendre plus de temps
- Les tests de performance vérifient les limites de temps
- Tous les tests sont asynchrones pour simuler le comportement réel