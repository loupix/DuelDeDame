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
import { ChatService } from './chat/chat.service';
import { GameService } from './game/game.service';

type Player = { socketId: string; clientId: string; color: 'white' | 'black' };
type Game = { players: Player[]; currentTurn: 'white' | 'black' };
const games: Record<string, Game> = {};

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly gameService: GameService
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    // Connexion établie
  }

  async handleDisconnect(socket: Socket) {
    for (const code in games) {
      // On conserve les slots/couleurs en cas de reconnexion via clientId
      const player = games[code].players.find(p => p.socketId === socket.id);
      if (player) player.socketId = '';
      // Si plus aucun joueur connu, on supprime la partie
      const anyActive = games[code].players.some(p => p.socketId);
      if (!anyActive) {
        delete games[code];
        // Supprimer aussi de la base de données
        await this.gameService.deleteGame(code);
      } else {
        const playerCount = games[code].players.filter(p => p.socketId).length;
        this.server.to(code).emit('players', playerCount);
        // Mettre à jour la base de données
        await this.gameService.updateGameStatus(code, 'waiting', playerCount);
      }
    }
  }

  @SubscribeMessage('join')
  async handleJoin(@MessageBody() payload: { code: string; clientId?: string } | string, @ConnectedSocket() socket: Socket) {
    const code = typeof payload === 'string' ? payload : payload.code;
    const clientId = typeof payload === 'string' ? '' : (payload.clientId || '');
    // console.log('[WS][recv][join]', { code, socketId: socket.id, clientId });
    
    // Créer la partie en base si elle n'existe pas
    if (!games[code]) {
      try {
        await this.gameService.createGame(code);
        games[code] = { players: [], currentTurn: 'white' };
      } catch (error) {
        socket.emit('error', 'Impossible de créer la partie');
        return;
      }
    }
    
    // Si clientId correspond à un joueur existant, réattribuer son socket et sa couleur
    if (clientId) {
      const existing = games[code].players.find(p => p.clientId === clientId);
      if (existing) {
        // Réattribuer le socket pour ce clientId
        existing.socketId = socket.id;
        socket.join(code);
        // console.log('[WS][emit][joined]', { to: socket.id, payload: { code, color: existing.color } });
        socket.emit('joined', { code, color: existing.color });
        this.server.to(code).emit('players', games[code].players.filter(p => p.socketId).length);
        // console.log('[WS][emit][turn]', { room: code, payload: games[code].currentTurn });
        this.server.to(code).emit('turn', games[code].currentTurn);
        return;
      }
    }
    if (games[code].players.filter(p => p.socketId).length >= 2) {
      // console.log('[WS][emit][full]', { to: socket.id });
      socket.emit('full');
      return;
    }
    const takenColors = new Set(games[code].players.map(p => p.color));
    const color: 'white' | 'black' = takenColors.has('white') ? 'black' : 'white';
    games[code].players.push({ socketId: socket.id, clientId: clientId || socket.id, color });
    socket.join(code);
    socket.emit('joined', { code, color });
    // console.log('[WS][emit][players]', { room: code, payload: games[code].players.filter(p => p.socketId).length });
    const playerCount = games[code].players.filter(p => p.socketId).length;
    this.server.to(code).emit('players', playerCount);
    // informer du tour courant
    // console.log('[WS][emit][turn]', { room: code, payload: games[code].currentTurn });
    this.server.to(code).emit('turn', games[code].currentTurn);
    
    // Mettre à jour la base de données
    await this.gameService.updateGameStatus(code, 'waiting', playerCount);
    
    // Message système pour l'arrivée d'un joueur
    const playerName = color === 'white' ? 'Blanc' : 'Noir';
    this.server.to(code).emit('systemMessage', { 
      message: `${playerName} a rejoint la partie` 
    });
  }

  @SubscribeMessage('ready')
  handleReady(@MessageBody() code: string, @ConnectedSocket() socket: Socket) {
    const game = games[code];
    if (!game) return;
    socket.join(code);
    socket.emit('turn', game.currentTurn);
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() data: { code: string; move: { from: [number, number]; to: [number, number] }; color: 'white' | 'black' },
    @ConnectedSocket() socket: Socket,
  ) {
    const game = games[data.code];
    if (!game) return;
    // Autoriser seulement si c'est le tour de la couleur qui émet
    if (data.color !== game.currentTurn) return;
    // Alterner le tour
    game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
    // Diffuser le coup (avec l'émetteur) et le prochain tour
    this.server.to(data.code).emit('move', { move: data.move, by: socket.id });
    this.server.to(data.code).emit('turn', game.currentTurn);
    
    // Message système pour le changement de tour
    const nextPlayer = game.currentTurn === 'white' ? 'Blanc' : 'Noir';
    this.server.to(data.code).emit('systemMessage', { 
      message: `C'est au tour de ${nextPlayer}` 
    });
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(
    @MessageBody() data: { 
      code: string; 
      message: string; 
      sender: 'white' | 'black'; 
      timestamp: string;
      isPredefined?: boolean;
      predefinedColor?: string;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const game = games[data.code];
    if (!game) return;
    
    // Vérifier que le joueur fait partie de la partie
    const player = game.players.find(p => p.socketId === socket.id);
    if (!player || player.color !== data.sender) return;
    
    // Persister et diffuser le message à tous les joueurs de la partie
    this.chatService.create({
      gameCode: data.code,
      message: data.message,
      sender: data.sender,
      isPredefined: !!data.isPredefined,
      predefinedColor: data.predefinedColor,
    }).catch(() => void 0);

    this.server.to(data.code).emit('chatMessage', {
      message: data.message,
      sender: data.sender,
      timestamp: data.timestamp,
      isPredefined: data.isPredefined,
      predefinedColor: data.predefinedColor,
    });
    
    // console.log('[WS][chat]', { 
    //   code: data.code, 
    //   sender: data.sender, 
    //   message: data.message,
    //   isPredefined: data.isPredefined 
    // });
  }
} 