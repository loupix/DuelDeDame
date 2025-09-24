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

type Player = { socketId: string; clientId: string; color: 'white' | 'black' };
type Game = { players: Player[]; currentTurn: 'white' | 'black' };
const games: Record<string, Game> = {};

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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
  handleJoin(@MessageBody() payload: { code: string; clientId?: string } | string, @ConnectedSocket() socket: Socket) {
    const code = typeof payload === 'string' ? payload : payload.code;
    const clientId = typeof payload === 'string' ? '' : (payload.clientId || '');
    console.log('[WS][recv][join]', { code, socketId: socket.id, clientId });
    if (!games[code]) games[code] = { players: [], currentTurn: 'white' };
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
  }
} 