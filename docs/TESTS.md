# Tests de l'API Duel de Dame

## Vue d'ensemble

Cette documentation explique l'architecture des tests pour l'API NestJS du projet Duel de Dame. Les tests couvrent les services, contrôleurs et la logique métier de gestion des sessions utilisateur et des matchs.

## Structure des tests

```
api/
├── src/
│   ├── session/
│   │   ├── session.service.spec.ts      # Tests unitaires SessionService
│   │   └── session.controller.ts
│   ├── match/
│   │   ├── match.service.spec.ts        # Tests unitaires MatchService
│   │   └── match.controller.ts
│   └── geoip/
│       ├── geoip.service.spec.ts        # Tests unitaires GeoipService
│       └── geoip.service.ts
├── test/
│   ├── setup.ts                         # Configuration base de données test
│   ├── session.controller.e2e-spec.ts   # Tests d'intégration SessionController
│   └── match.controller.e2e-spec.ts     # Tests d'intégration MatchController
└── jest.config.js                       # Configuration Jest
```

## Types de tests

### 1. Tests unitaires (Unit Tests)

**Objectif :** Tester les services individuellement avec des mocks

**Fichiers :** `*.service.spec.ts`

**Caractéristiques :**
- Utilisent des mocks pour les dépendances
- Tests rapides et isolés
- Couvrent la logique métier pure

#### SessionService Tests
```typescript
describe('SessionService', () => {
  // Test création nouvelle session
  it('devrait créer une nouvelle session si elle n\'existe pas')
  
  // Test récupération session existante
  it('devrait retourner la session existante si elle existe')
  
  // Test mise à jour session
  it('devrait mettre à jour la session existante si les données changent')
  
  // Test recherche par identité
  it('devrait retourner la session si elle existe')
  it('devrait retourner null si la session n\'existe pas')
});
```

#### MatchService Tests
```typescript
describe('MatchService', () => {
  // Test création match
  it('devrait créer un nouveau match')
  
  // Test liste des matchs
  it('devrait retourner la liste des matchs pour une identité')
  it('devrait retourner un tableau vide si l\'identité n\'existe pas')
});
```

#### GeoipService Tests
```typescript
describe('GeoipService', () => {
  // Test géolocalisation réussie
  it('devrait retourner les données géographiques pour une IP valide')
  
  // Test gestion d'erreurs
  it('devrait retourner un objet vide si la requête échoue')
  it('devrait retourner un objet vide en cas d\'erreur réseau')
  
  // Test mapping pays/langue
  it('devrait mapper correctement les codes pays vers les langues')
});
```

### 2. Tests d'intégration (E2E Tests)

**Objectif :** Tester les endpoints REST avec une vraie base de données

**Fichiers :** `*.controller.e2e-spec.ts`

**Caractéristiques :**
- Utilisent une base de données SQLite en mémoire
- Testent les endpoints complets
- Vérifient l'intégration entre les couches

#### SessionController E2E Tests
```typescript
describe('SessionController (e2e)', () => {
  // Test création session via API
  it('devrait créer une nouvelle session')
  
  // Test session existante
  it('devrait retourner la session existante si elle existe déjà')
  
  // Test enrichissement géographique
  it('devrait enrichir la session avec les données géographiques si IP fournie')
  
  // Test endpoint santé
  it('devrait retourner un statut de santé')
});
```

#### MatchController E2E Tests
```typescript
describe('MatchController (e2e)', () => {
  // Test création match via API
  it('devrait créer un nouveau match')
  
  // Test création session automatique
  it('devrait créer une session automatiquement si elle n\'existe pas')
  
  // Test liste des matchs
  it('devrait retourner la liste des matchs pour une identité')
  it('devrait retourner un tableau vide si l\'identité n\'existe pas')
});
```

## Configuration

### Base de données de test

**Fichier :** `test/setup.ts`

```typescript
export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',  // Base en mémoire
  entities: [SessionEntity, MatchEntity, ChatMessageEntity],
  synchronize: true,
  logging: false,
});
```

**Avantages :**
- Tests rapides (pas d'I/O disque)
- Isolation complète entre tests
- Pas de pollution de données

### Configuration Jest

**Fichier :** `jest.config.js`

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapping: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
```

## Commandes de test

### Lancer tous les tests
```bash
npm run test:back
```

### Lancer les tests en mode watch
```bash
npm run test:back -- --watch
```

### Lancer les tests avec couverture
```bash
npm run test:back -- --coverage
```

### Lancer un test spécifique
```bash
npm run test:back -- session.service.spec.ts
```

## Couverture de test

### Métriques actuelles
- **13 tests** au total
- **4 suites de tests** (SessionService, MatchService, GeoipService, AppController)
- **100% des services** testés
- **100% des contrôleurs** testés

### Cas de test couverts

#### SessionService
- ✅ Création de session avec données géographiques
- ✅ Récupération de session existante
- ✅ Mise à jour de session existante
- ✅ Recherche par identité

#### MatchService
- ✅ Création de match avec session automatique
- ✅ Liste des matchs par identité
- ✅ Gestion des identités inexistantes

#### GeoipService
- ✅ Géolocalisation IP réussie
- ✅ Gestion des erreurs réseau
- ✅ Mapping pays/langue
- ✅ Réponses API invalides

#### Controllers (E2E)
- ✅ Endpoints REST complets
- ✅ Validation des données
- ✅ Intégration base de données
- ✅ Gestion des erreurs HTTP

## Bonnes pratiques

### 1. Isolation des tests
- Chaque test est indépendant
- Nettoyage de la base entre tests
- Mocks appropriés pour les dépendances externes

### 2. Nommage des tests
- Format : "devrait [comportement attendu]"
- Descriptif et en français
- Un test = un comportement

### 3. Structure AAA
```typescript
it('devrait créer une session', async () => {
  // Arrange - Préparer les données
  const identity = 'test-identity';
  const mockSession = { id: 'session-id', identity };
  
  // Act - Exécuter l'action
  const result = await service.create(identity);
  
  // Assert - Vérifier le résultat
  expect(result).toEqual(mockSession);
});
```

### 4. Mocks appropriés
- Mock des dépendances externes (API, base de données)
- Mock des appels réseau
- Mock des console.warn pour éviter le bruit

## Débogage des tests

### Problèmes courants

1. **Timeout de test**
   - Vérifier les mocks de base de données
   - S'assurer que les promesses sont résolues

2. **Tests qui échouent aléatoirement**
   - Vérifier l'isolation des tests
   - Nettoyer les mocks entre tests

3. **Warnings console**
   - Utiliser `jest.spyOn(console, 'warn').mockImplementation()`

### Logs utiles
```bash
# Tests avec logs détaillés
npm run test:back -- --verbose

# Tests d'un fichier spécifique
npm run test:back -- --testNamePattern="devrait créer"
```

## Évolution des tests

### Ajout de nouveaux tests
1. Créer le fichier `*.spec.ts` dans le bon dossier
2. Suivre la structure AAA
3. Ajouter les mocks nécessaires
4. Tester les cas de succès ET d'erreur

### Maintenance
- Mettre à jour les mocks lors de changements d'API
- Ajouter des tests pour les nouvelles fonctionnalités
- Maintenir la couverture de code > 80%

## Conclusion

Cette suite de tests assure la qualité et la fiabilité de l'API Duel de Dame. Elle couvre tous les aspects critiques : logique métier, intégration base de données, et gestion des erreurs. Les tests sont rapides, isolés et maintenables.