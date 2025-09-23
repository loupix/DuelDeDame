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

type Player = { id: string; color: 'white' | 'black' };
type Game = { players: Player[]; currentTurn: 'white' | 'black' };
const games: Record<string, Game> = {};

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    // Logs connexion
    console.log('[WS][connect]', { socketId: socket.id });
  }

  handleDisconnect(socket: Socket) {
    console.log('[WS][disconnect]', { socketId: socket.id });
    for (const code in games) {
      games[code].players = games[code].players.filter(p => p.id !== socket.id);
      if (games[code].players.length === 0) delete games[code];
      else this.server.to(code).emit('players', games[code].players.length);
    }
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() code: string, @ConnectedSocket() socket: Socket) {
    console.log('[WS][recv][join]', { code, socketId: socket.id });
    if (!games[code]) games[code] = { players: [], currentTurn: 'white' };
    if (games[code].players.length >= 2) {
      console.log('[WS][emit][full]', { to: socket.id });
      socket.emit('full');
      return;
    }
    const color: 'white' | 'black' = games[code].players.length === 0 ? 'white' : 'black';
    games[code].players.push({ id: socket.id, color });
    socket.join(code);
    console.log('[WS][emit][joined]', { to: socket.id, payload: { code, color } });
    socket.emit('joined', { code, color });
    console.log('[WS][emit][players]', { room: code, payload: games[code].players.length });
    this.server.to(code).emit('players', games[code].players.length);
    // informer du tour courant
    console.log('[WS][emit][turn]', { room: code, payload: games[code].currentTurn });
    this.server.to(code).emit('turn', games[code].currentTurn);
  }

  @SubscribeMessage('ready')
  handleReady(@MessageBody() code: string, @ConnectedSocket() socket: Socket) {
    console.log('[WS][recv][ready]', { code, socketId: socket.id });
    const game = games[code];
    if (!game) return;
    socket.join(code);
    console.log('[WS][emit][turn]', { to: socket.id, payload: game.currentTurn });
    socket.emit('turn', game.currentTurn);
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() data: { code: string; move: { from: [number, number]; to: [number, number] }; color: 'white' | 'black' },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('[WS][recv][move]', { code: data.code, move: data.move, color: data.color, socketId: socket.id });
    const game = games[data.code];
    if (!game) return;
    // Autoriser seulement si c'est le tour de la couleur qui émet
    if (data.color !== game.currentTurn) return;
    // Alterner le tour
    game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
    // Diffuser le coup (avec l'émetteur) et le prochain tour
    console.log('[WS][emit][move]', { room: data.code, payload: { move: data.move, by: socket.id } });
    this.server.to(data.code).emit('move', { move: data.move, by: socket.id });
    console.log('[WS][emit][turn]', { room: data.code, payload: game.currentTurn });
    this.server.to(data.code).emit('turn', game.currentTurn);
  }
} 