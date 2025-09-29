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
    let code = typeof payload === 'string' ? payload : payload.code;
    const clientId = typeof payload === 'string' ? '' : (payload.clientId || '');
    
    try {
      // Vérifier l'état de la partie via l'API
      let gameState = await this.gameService.getGameByCode(code);
      
      if (!gameState) {
        // La partie n'existe pas, essayer de la créer
        if (clientId) {
          // Si le code est vide, laisser l'API générer un code unique
          const createDto = code && code.trim() ? { code, playerId: clientId } : { playerId: clientId };
          const createdGame = await this.gameService.create(createDto);
          // Mettre à jour le code avec celui généré par l'API
          if (createdGame.code !== code) {
            code = createdGame.code;
          }
          // Récupérer l'état de la partie créée
          gameState = createdGame;
        } else {
          socket.emit('error', { message: 'Partie non trouvée' });
          return;
        }
      } else {
        // La partie existe, essayer de rejoindre
        if (clientId) {
          try {
            const joinResult = await this.gameService.joinGame({ code, playerId: clientId });
            // Mettre à jour l'état de la partie après le join
            gameState = joinResult;
          } catch (error) {
            if (error.message === 'Partie pleine') {
              socket.emit('full');
              return;
            }
            socket.emit('error', { message: error.message });
            return;
          }
        }
      }
      
      // Synchroniser avec le système WebSocket local
      if (!games[code]) {
        games[code] = { players: [], currentTurn: 'white' };
      }
      
      // Synchroniser les joueurs avec l'état de la base de données
      const dbPlayerCount = (gameState.whitePlayerId ? 1 : 0) + (gameState.blackPlayerId ? 1 : 0);
      
      // Synchroniser le système WebSocket avec la base de données
      const existingPlayers = games[code].players;
      const dbPlayers = [];
      
      // Ajouter le joueur blanc s'il existe
      if (gameState.whitePlayerId) {
        const existingWhite = existingPlayers.find(p => p.clientId === gameState.whitePlayerId);
        if (existingWhite) {
          dbPlayers.push(existingWhite);
        } else {
          dbPlayers.push({ socketId: null, clientId: gameState.whitePlayerId, color: 'white' });
        }
      }
      
      // Ajouter le joueur noir s'il existe
      if (gameState.blackPlayerId) {
        const existingBlack = existingPlayers.find(p => p.clientId === gameState.blackPlayerId);
        if (existingBlack) {
          dbPlayers.push(existingBlack);
        } else {
          dbPlayers.push({ socketId: null, clientId: gameState.blackPlayerId, color: 'black' });
        }
      }
      
      // Mettre à jour le système WebSocket local
      games[code].players = dbPlayers;
      
      // Si clientId correspond à un joueur existant, réattribuer son socket et sa couleur
      if (clientId) {
        const existing = games[code].players.find(p => p.clientId === clientId);
        if (existing) {
          existing.socketId = socket.id;
          socket.join(code);
          socket.emit('joined', { code, color: existing.color });
          this.server.to(code).emit('players', games[code].players.filter(p => p.socketId).length);
          this.server.to(code).emit('turn', games[code].currentTurn);
          return;
        }
      }
      
      // Vérifier si la partie est pleine côté base de données
      console.log(`[Gateway] Code: ${code}, DB Players: ${dbPlayerCount}, WS Players: ${games[code].players.length}`);
      console.log(`[Gateway] White: ${gameState.whitePlayerId}, Black: ${gameState.blackPlayerId}`);
      
      if (dbPlayerCount >= 2) {
        console.log(`[Gateway] Partie pleine côté DB, émission 'full'`);
        socket.emit('full');
        return;
      }
      
      // Déterminer la couleur basée sur l'état de la base de données
      let color: 'white' | 'black';
      if (!gameState.whitePlayerId) {
        color = 'white';
      } else if (!gameState.blackPlayerId) {
        color = 'black';
      } else {
        // Fallback: utiliser les couleurs déjà prises dans WebSocket
        const takenColors = new Set(games[code].players.map(p => p.color));
        color = takenColors.has('white') ? 'black' : 'white';
      }
      
      // Ajouter le nouveau joueur au système WebSocket local seulement s'il n'est pas déjà dans la partie
      const isAlreadyInGame = games[code].players.some(p => p.clientId === clientId);
      if (!isAlreadyInGame) {
        games[code].players.push({ socketId: socket.id, clientId: clientId || socket.id, color });
      } else {
        // Mettre à jour le socket du joueur existant
        const existingPlayer = games[code].players.find(p => p.clientId === clientId);
        if (existingPlayer) {
          existingPlayer.socketId = socket.id;
        }
      }
      
      socket.join(code);
      socket.emit('joined', { code, color });
      this.server.to(code).emit('players', games[code].players.filter(p => p.socketId).length);
      this.server.to(code).emit('turn', games[code].currentTurn);
      
      // Message système pour l'arrivée d'un joueur
      const playerName = color === 'white' ? 'Blanc' : 'Noir';
      this.server.to(code).emit('systemMessage', { 
        message: `${playerName} a rejoint la partie` 
      });
      
    } catch (error) {
      console.error('Erreur lors de la connexion à la partie:', error);
      socket.emit('error', { message: 'Erreur de connexion' });
    }
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