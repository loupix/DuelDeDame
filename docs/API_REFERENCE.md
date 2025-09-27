# Référence API - Duel de Dame

## Base URL
```
http://localhost:3001
```

## Endpoints

### Sessions

#### POST /sessions
Créer ou récupérer une session utilisateur.

**Body:**
```json
{
  "identity": "string",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "avatarColor": "string (optional)",
  "countryCode": "string (optional)",
  "language": "string (optional)",
  "timezone": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "identity": "string",
  "firstName": "string",
  "lastName": "string",
  "avatarColor": "string",
  "countryCode": "string",
  "language": "string",
  "timezone": "string",
  "createdAt": "datetime"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3001/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "u_abc123",
    "firstName": "John",
    "lastName": "Doe",
    "avatarColor": "#ff0000"
  }'
```

#### GET /sessions/health
Vérifier le statut du service.

**Response:**
```json
{
  "ok": true
}
```

### Matches

#### POST /matches
Créer un nouveau match.

**Body:**
```json
{
  "identity": "string",
  "code": "string",
  "result": "win|loss|draw",
  "color": "white|black",
  "duration": "number",
  "moves": "number"
}
```

**Response:**
```json
{
  "id": "uuid",
  "code": "string",
  "result": "win|loss|draw",
  "color": "white|black",
  "duration": "number",
  "moves": "number",
  "createdAt": "datetime"
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3001/matches \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "u_abc123",
    "code": "ABC123",
    "result": "win",
    "color": "white",
    "duration": 300,
    "moves": 25
  }'
```

#### GET /matches?identity={identity}
Récupérer la liste des matchs pour une identité.

**Query Parameters:**
- `identity` (required): Identité de la session

**Response:**
```json
[
  {
    "id": "uuid",
    "code": "string",
    "result": "win|loss|draw",
    "color": "white|black",
    "duration": "number",
    "moves": "number",
    "createdAt": "datetime"
  }
]
```

**Exemple:**
```bash
curl "http://localhost:3001/matches?identity=u_abc123"
```

### Chat

#### GET /chat/history/{gameCode}?limit={limit}
Récupérer l'historique des messages d'une partie.

**Path Parameters:**
- `gameCode` (required): Code de la partie

**Query Parameters:**
- `limit` (optional): Nombre maximum de messages (défaut: 100, max: 500)

**Response:**
```json
[
  {
    "id": "uuid",
    "gameCode": "string",
    "message": "string",
    "sender": "white|black|system",
    "isPredefined": "boolean",
    "predefinedColor": "string",
    "timestamp": "datetime"
  }
]
```

**Exemple:**
```bash
curl "http://localhost:3001/chat/history/ABC123?limit=50"
```

## WebSocket Events

### Connexion
```javascript
const socket = io('http://localhost:3001');
```

### Events émis par le client

#### join
Rejoindre une partie.
```javascript
socket.emit('join', { code: 'ABC123', clientId: 'client-uuid' });
```

#### ready
Signaler que le joueur est prêt.
```javascript
socket.emit('ready', 'ABC123');
```

#### move
Jouer un coup.
```javascript
socket.emit('move', {
  code: 'ABC123',
  move: { from: [1, 2], to: [3, 4] }
});
```

### Events reçus du serveur

#### joined
Confirmation de connexion à la partie.
```javascript
socket.on('joined', (data) => {
  console.log('Partie rejointe:', data);
  // data = { code: 'ABC123', color: 'white' }
});
```

#### players
Mise à jour du nombre de joueurs.
```javascript
socket.on('players', (count) => {
  console.log('Joueurs connectés:', count);
});
```

#### turn
Changement de tour.
```javascript
socket.on('turn', (color) => {
  console.log('Tour de:', color); // 'white' ou 'black'
});
```

#### move
Coup joué par un autre joueur.
```javascript
socket.on('move', (data) => {
  console.log('Coup reçu:', data);
  // data = { move: { from: [1, 2], to: [3, 4] }, by: 'socket-id' }
});
```

#### gameEnd
Fin de partie.
```javascript
socket.on('gameEnd', (result) => {
  console.log('Partie terminée:', result);
  // result = { winner: 'white'|'black', reason: 'string' }
});
```

#### full
Partie pleine.
```javascript
socket.on('full', () => {
  console.log('Partie pleine');
});
```

#### replaced
Joueur remplacé.
```javascript
socket.on('replaced', () => {
  console.log('Joueur remplacé');
});
```

## Codes d'erreur HTTP

- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `404` - Non trouvé
- `500` - Erreur serveur

## Exemples d'utilisation

### Créer une session et jouer
```javascript
// 1. Créer une session
const sessionResponse = await fetch('http://localhost:3001/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identity: 'u_abc123',
    firstName: 'John',
    lastName: 'Doe'
  })
});
const session = await sessionResponse.json();

// 2. Se connecter au WebSocket
const socket = io('http://localhost:3001');

// 3. Rejoindre une partie
socket.emit('join', { code: 'ABC123', clientId: 'client-uuid' });

// 4. Écouter les événements
socket.on('joined', (data) => {
  console.log('Partie rejointe:', data);
});

// 5. Jouer un coup
socket.emit('move', {
  code: 'ABC123',
  move: { from: [1, 2], to: [3, 4] }
});

// 6. Enregistrer le match à la fin
socket.on('gameEnd', async (result) => {
  await fetch('http://localhost:3001/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: session.identity,
      code: 'ABC123',
      result: result.winner === 'white' ? 'win' : 'loss',
      color: 'white',
      duration: 300,
      moves: 25
    })
  });
});
```

### Récupérer l'historique des matchs
```javascript
const matchesResponse = await fetch('http://localhost:3001/matches?identity=u_abc123');
const matches = await matchesResponse.json();

console.log('Matchs joués:', matches);
```

## Notes importantes

1. **Géolocalisation automatique** : L'API détecte automatiquement le pays, fuseau horaire et langue à partir de l'IP du client lors de la création de session.

2. **Sessions persistantes** : Les sessions sont créées automatiquement si elles n'existent pas.

3. **WebSocket** : Utilise Socket.io pour la communication temps réel.

4. **Base de données** : SQLite avec TypeORM pour la persistance.

5. **CORS** : Configuré pour accepter toutes les origines en développement.