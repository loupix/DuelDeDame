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
type Game = { players: Player[]; state: any };
const games: Record<string, Game> = {};

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    // Rien à faire ici pour l'instant
  }

  handleDisconnect(socket: Socket) {
    for (const code in games) {
      games[code].players = games[code].players.filter(p => p.id !== socket.id);
      if (games[code].players.length === 0) delete games[code];
      else this.server.to(code).emit('players', games[code].players.length);
    }
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() code: string, @ConnectedSocket() socket: Socket) {
    if (!games[code]) games[code] = { players: [], state: null };
    if (games[code].players.length >= 2) {
      socket.emit('full');
      return;
    }
    const color: 'white' | 'black' = games[code].players.length === 0 ? 'white' : 'black';
    games[code].players.push({ id: socket.id, color });
    socket.join(code);
    socket.emit('joined', { code, color });
    this.server.to(code).emit('players', games[code].players.length);
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() data: { code: string; move: any },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.to(data.code).emit('move', data.move);
  }
} 