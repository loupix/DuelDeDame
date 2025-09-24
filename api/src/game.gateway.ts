import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './services/game.service';

type Player = { socketId: string; clientId: string; color: 'white' | 'black' };
type Game = { players: Player[]; currentTurn: 'white' | 'black' };
const games: Record<string, Game> = {};

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(socket: Socket) {
    // Connexion établie
  }

  handleDisconnect(socket: Socket) {
    for (const code in games) {
      // On conserve les slots/couleurs en cas de reconnexion via clientId
      const player = games[code].players.find(p => p.socketId === socket.id);
      if (player) player.socketId = '';
      // Si plus aucun joueur connu, on supprime la partie
      const anyActive = games[code].players.some(p => p.socketId);
      if (!anyActive) delete games[code];
      else this.server.to(code).emit('players', games[code].players.filter(p => p.socketId).length);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(@MessageBody() payload: { code: string; clientId?: string } | string, @ConnectedSocket() socket: Socket) {
    const code = typeof payload === 'string' ? payload : payload.code;
    const clientId = typeof payload === 'string' ? '' : (payload.clientId || '');
    console.log('[WS][recv][join]', { code, socketId: socket.id, clientId });
    
    // Créer ou récupérer la partie en base de données
    if (!games[code]) {
      let dbGame = await this.gameService.findGameByCode(code);
      if (!dbGame) {
        dbGame = await this.gameService.createGame(code);
        console.log('[DB] Nouvelle partie créée:', code);
      }
      games[code] = { players: [], currentTurn: dbGame.currentTurn || 'white' };
    }
    // Si clientId correspond à un joueur existant, réattribuer son socket et sa couleur
    if (clientId) {
      const existing = games[code].players.find(p => p.clientId === clientId);
      if (existing) {
        // Réattribuer le socket pour ce clientId
        existing.socketId = socket.id;
        socket.join(code);
        console.log('[WS][emit][joined]', { to: socket.id, payload: { code, color: existing.color } });
        socket.emit('joined', { code, color: existing.color });
        this.server.to(code).emit('players', games[code].players.filter(p => p.socketId).length);
        console.log('[WS][emit][turn]', { room: code, payload: games[code].currentTurn });
        this.server.to(code).emit('turn', games[code].currentTurn);
        return;
      }
    }
    if (games[code].players.filter(p => p.socketId).length >= 2) {
      console.log('[WS][emit][full]', { to: socket.id });
      socket.emit('full');
      return;
    }
    const takenColors = new Set(games[code].players.map(p => p.color));
    const color: 'white' | 'black' = takenColors.has('white') ? 'black' : 'white';
    games[code].players.push({ socketId: socket.id, clientId: clientId || socket.id, color });
    
    // Enregistrer le joueur en base de données
    await this.gameService.addPlayer(code, clientId || socket.id, color);
    console.log('[DB] Joueur ajouté:', { code, clientId: clientId || socket.id, color });
    
    socket.join(code);
    socket.emit('joined', { code, color });
    console.log('[WS][emit][players]', { room: code, payload: games[code].players.filter(p => p.socketId).length });
    this.server.to(code).emit('players', games[code].players.filter(p => p.socketId).length);
    // informer du tour courant
    console.log('[WS][emit][turn]', { room: code, payload: games[code].currentTurn });
    this.server.to(code).emit('turn', games[code].currentTurn);
  }

  @SubscribeMessage('ready')
  handleReady(@MessageBody() code: string, @ConnectedSocket() socket: Socket) {
    const game = games[code];
    if (!game) return;
    socket.join(code);
    socket.emit('turn', game.currentTurn);
  }

  @SubscribeMessage('move')
  async handleMove(
    @MessageBody() data: { code: string; move: { from: [number, number]; to: [number, number] }; color: 'white' | 'black' },
    @ConnectedSocket() socket: Socket,
  ) {
    const game = games[data.code];
    if (!game) return;
    
    // Autoriser seulement si c'est le tour de la couleur qui émet
    if (data.color !== game.currentTurn) return;
    
    try {
      // Enregistrer le mouvement en base de données
      const isCapture = Math.abs(data.move.to[0] - data.move.from[0]) === 2 && 
                       Math.abs(data.move.to[1] - data.move.from[1]) === 2;
      
      await this.gameService.recordMove(
        data.code,
        data.color,
        data.move.from,
        data.move.to,
        'piece', // Type de pièce (à améliorer si nécessaire)
        isCapture,
        false // isPromotion (à implémenter si nécessaire)
      );
      
      console.log('[DB] Mouvement enregistré:', { code: data.code, move: data.move, color: data.color });
      
      // Alterner le tour
      game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
      
      // Diffuser le coup (avec l'émetteur) et le prochain tour
      this.server.to(data.code).emit('move', { move: data.move, by: socket.id });
      this.server.to(data.code).emit('turn', game.currentTurn);
      
    } catch (error) {
      console.error('[DB] Erreur lors de l\'enregistrement du mouvement:', error);
      // En cas d'erreur, on peut quand même diffuser le mouvement
      game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
      this.server.to(data.code).emit('move', { move: data.move, by: socket.id });
      this.server.to(data.code).emit('turn', game.currentTurn);
    }
  }

  @SubscribeMessage('gameEnd')
  async handleGameEnd(
    @MessageBody() data: { code: string; winner?: 'white' | 'black' },
    @ConnectedSocket() socket: Socket,
  ) {
    const game = games[data.code];
    if (!game) return;

    try {
      // Enregistrer la fin de partie en base de données
      await this.gameService.endGame(data.code, data.winner);
      console.log('[DB] Partie terminée:', { code: data.code, winner: data.winner });
      
      // Diffuser la fin de partie
      this.server.to(data.code).emit('gameEnd', { winner: data.winner });
      
    } catch (error) {
      console.error('[DB] Erreur lors de la fin de partie:', error);
    }
  }
} 