import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity } from './game.entity';
import { SessionService } from '../session/session.service';

export interface CreateGameDto {
  code: string;
  playerId: string;
}

export interface JoinGameDto {
  code: string;
  playerId: string;
}

export interface GameStateDto {
  id: string;
  code: string;
  status: 'waiting' | 'active' | 'finished';
  currentTurn?: 'white' | 'black';
  whitePlayerId?: string;
  blackPlayerId?: string;
  moveCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameEntity)
    private readonly repo: Repository<GameEntity>,
    private readonly sessionService: SessionService,
  ) {}

  async create(dto: CreateGameDto): Promise<GameStateDto> {
    // Vérifier si une partie avec ce code existe déjà
    const existingGame = await this.repo.findOne({ where: { code: dto.code } });
    
    if (existingGame) {
      // Si la partie existe et n'est pas terminée, essayer de rejoindre
      if (existingGame.status !== 'finished') {
        return this.joinGame({ code: dto.code, playerId: dto.playerId });
      }
      throw new Error('Partie terminée');
    }

    // Créer une nouvelle partie
    const session = await this.sessionService.findOrCreateByIdentity(dto.playerId);
    const entity = this.repo.create({
      code: dto.code,
      whitePlayerId: dto.playerId,
      whitePlayer: session,
      status: 'waiting',
      currentTurn: 'white',
    });
    
    const savedGame = await this.repo.save(entity);
    return this.mapToDto(savedGame);
  }

  async joinGame(dto: JoinGameDto): Promise<GameStateDto> {
    const game = await this.repo.findOne({ 
      where: { code: dto.code },
      relations: ['whitePlayer', 'blackPlayer']
    });
    
    if (!game) {
      throw new Error('Partie non trouvée');
    }

    if (game.status === 'finished') {
      throw new Error('Partie terminée');
    }

    // Si le joueur est déjà dans la partie, retourner l'état actuel
    if (game.whitePlayerId === dto.playerId || game.blackPlayerId === dto.playerId) {
      return this.mapToDto(game);
    }

    // Si la partie est pleine
    if (game.whitePlayerId && game.blackPlayerId) {
      throw new Error('Partie pleine');
    }

    // Ajouter le joueur à la partie
    const session = await this.sessionService.findOrCreateByIdentity(dto.playerId);
    
    if (!game.whitePlayerId) {
      game.whitePlayerId = dto.playerId;
      game.whitePlayer = session;
    } else if (!game.blackPlayerId) {
      game.blackPlayerId = dto.playerId;
      game.blackPlayer = session;
    }

    // Si les deux joueurs sont présents, démarrer la partie
    if (game.whitePlayerId && game.blackPlayerId) {
      game.status = 'active';
    }

    const savedGame = await this.repo.save(game);
    return this.mapToDto(savedGame);
  }

  async getGameByCode(code: string): Promise<GameStateDto | null> {
    const game = await this.repo.findOne({ 
      where: { code },
      relations: ['whitePlayer', 'blackPlayer']
    });
    
    if (!game) return null;
    return this.mapToDto(game);
  }

  async updateGameState(code: string, updates: Partial<GameEntity>): Promise<GameStateDto> {
    const game = await this.repo.findOne({ where: { code } });
    if (!game) {
      throw new Error('Partie non trouvée');
    }

    Object.assign(game, updates);
    const savedGame = await this.repo.save(game);
    return this.mapToDto(savedGame);
  }

  async finishGame(code: string, winner?: 'white' | 'black'): Promise<GameStateDto> {
    const game = await this.repo.findOne({ where: { code } });
    if (!game) {
      throw new Error('Partie non trouvée');
    }

    game.status = 'finished';
    const savedGame = await this.repo.save(game);
    return this.mapToDto(savedGame);
  }

  async getActiveGamesByPlayer(playerId: string): Promise<GameStateDto[]> {
    const games = await this.repo.find({
      where: [
        { whitePlayerId: playerId, status: 'active' },
        { blackPlayerId: playerId, status: 'active' },
        { whitePlayerId: playerId, status: 'waiting' },
        { blackPlayerId: playerId, status: 'waiting' }
      ],
      relations: ['whitePlayer', 'blackPlayer'],
      order: { updatedAt: 'DESC' }
    });

    return games.map(game => this.mapToDto(game));
  }

  private mapToDto(game: GameEntity): GameStateDto {
    return {
      id: game.id,
      code: game.code,
      status: game.status,
      currentTurn: game.currentTurn,
      whitePlayerId: game.whitePlayerId,
      blackPlayerId: game.blackPlayerId,
      moveCount: game.moveCount,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }
}