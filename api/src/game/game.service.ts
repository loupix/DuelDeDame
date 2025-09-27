import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity } from './game.entity';

export interface GameInfo {
  code: string;
  players: number;
  maxPlayers: number;
  isFull: boolean;
  canJoin: boolean;
  shareUrl: string;
  status: string;
  name?: string;
  description?: string;
}

@Injectable()
export class GameService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
  ) {}

  async getGameInfo(code: string): Promise<GameInfo> {
    const game = await this.gameRepository.findOne({ where: { code } });
    const shareUrl = `${this.baseUrl}/join/${code}`;
    
    if (!game) {
      return {
        code,
        players: 0,
        maxPlayers: 2,
        isFull: false,
        canJoin: true,
        shareUrl,
        status: 'not_found'
      };
    }

    return {
      code: game.code,
      players: game.playerCount,
      maxPlayers: game.maxPlayers,
      isFull: game.playerCount >= game.maxPlayers,
      canJoin: game.status === 'waiting' && game.playerCount < game.maxPlayers,
      shareUrl,
      status: game.status,
      name: game.name,
      description: game.description
    };
  }

  async createGame(customCode?: string, name?: string, description?: string): Promise<GameInfo> {
    const code = customCode || this.generateGameCode();
    const shareUrl = `${this.baseUrl}/join/${code}`;
    
    // Vérifier si le code existe déjà
    const existingGame = await this.gameRepository.findOne({ where: { code } });
    if (existingGame) {
      throw new Error('Ce code de partie existe déjà');
    }

    const game = this.gameRepository.create({
      code,
      name,
      description,
      status: 'waiting',
      currentTurn: 'white',
      playerCount: 0,
      maxPlayers: 2,
      isPublic: true
    });

    await this.gameRepository.save(game);
    
    return {
      code: game.code,
      players: game.playerCount,
      maxPlayers: game.maxPlayers,
      isFull: false,
      canJoin: true,
      shareUrl,
      status: game.status,
      name: game.name,
      description: game.description
    };
  }

  async joinGame(code: string): Promise<GameInfo> {
    return this.getGameInfo(code);
  }

  async updateGameStatus(code: string, status: 'waiting' | 'playing' | 'finished', playerCount?: number): Promise<void> {
    const game = await this.gameRepository.findOne({ where: { code } });
    if (game) {
      game.status = status;
      if (playerCount !== undefined) {
        game.playerCount = playerCount;
      }
      await this.gameRepository.save(game);
    }
  }

  async deleteGame(code: string): Promise<void> {
    await this.gameRepository.delete({ code });
  }

  private generateGameCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}