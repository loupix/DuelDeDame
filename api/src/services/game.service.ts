import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/game.entity';
import { Move } from '../entities/move.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(Move)
    private moveRepository: Repository<Move>,
  ) {}

  async createGame(code: string): Promise<Game> {
    const game = this.gameRepository.create({
      code,
      status: 'waiting',
      currentTurn: 'white',
      moveCount: 0,
      duration: 0,
    });

    return await this.gameRepository.save(game);
  }

  async findGameByCode(code: string): Promise<Game | null> {
    return await this.gameRepository.findOne({
      where: { code },
      relations: ['moves'],
      order: { moves: { moveNumber: 'ASC' } }
    });
  }

  async updateGameStatus(code: string, status: 'waiting' | 'active' | 'finished', winner?: 'white' | 'black'): Promise<Game | null> {
    const game = await this.findGameByCode(code);
    if (!game) return null;

    game.status = status;
    if (winner) {
      game.winner = winner;
    }

    return await this.gameRepository.save(game);
  }

  async addPlayer(code: string, playerId: string, color: 'white' | 'black', playerName?: string): Promise<Game | null> {
    const game = await this.findGameByCode(code);
    if (!game) return null;

    if (color === 'white') {
      game.whitePlayerId = playerId;
      game.whitePlayerName = playerName || 'Joueur Blanc';
    } else {
      game.blackPlayerId = playerId;
      game.blackPlayerName = playerName || 'Joueur Noir';
    }

    // Si les deux joueurs sont connectés, activer la partie
    if (game.whitePlayerId && game.blackPlayerId) {
      game.status = 'active';
    }

    return await this.gameRepository.save(game);
  }

  async recordMove(
    code: string,
    player: 'white' | 'black',
    from: [number, number],
    to: [number, number],
    piece: string,
    isCapture: boolean = false,
    isPromotion: boolean = false
  ): Promise<Move | null> {
    const game = await this.findGameByCode(code);
    if (!game) return null;

    // Vérifier que c'est bien le tour du joueur
    if (game.currentTurn !== player) {
      throw new Error(`Ce n'est pas le tour de ${player}`);
    }

    // Créer et lier la relation correctement
    const move = this.moveRepository.create({
      game,
      player,
      fromX: from[0],
      fromY: from[1],
      toX: to[0],
      toY: to[1],
      piece,
      isCapture,
      isPromotion,
      moveNumber: game.moveCount + 1,
      notation: this.generateNotation(from, to, piece, isCapture),
    });

    const savedMove = await this.moveRepository.save(move);

    // Mettre à jour le jeu
    game.moveCount += 1;
    game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
    game.duration = Math.floor((Date.now() - game.createdAt.getTime()) / 1000);

    await this.gameRepository.save(game);

    return savedMove;
  }

  async endGame(code: string, winner?: 'white' | 'black'): Promise<Game | null> {
    const game = await this.findGameByCode(code);
    if (!game) return null;

    game.status = 'finished';
    game.winner = winner || null;
    game.duration = Math.floor((Date.now() - game.createdAt.getTime()) / 1000);

    return await this.gameRepository.save(game);
  }

  async getGameReplay(code: string): Promise<{ game: Game; moves: Move[] } | null> {
    const game = await this.findGameByCode(code);
    if (!game) return null;

    return {
      game,
      moves: game.moves || []
    };
  }

  async getRecentGames(limit: number = 10): Promise<Game[]> {
    return await this.gameRepository.find({
      where: { status: 'finished' },
      relations: ['moves'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }

  async getPlayerGames(playerId: string, limit: number = 10): Promise<Game[]> {
    return await this.gameRepository.find({
      where: [
        { whitePlayerId: playerId },
        { blackPlayerId: playerId }
      ],
      relations: ['moves'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }

  private generateNotation(from: [number, number], to: [number, number], piece: string, isCapture: boolean): string {
    const fromSquare = this.coordinatesToSquare(from);
    const toSquare = this.coordinatesToSquare(to);
    const captureSymbol = isCapture ? 'x' : '-';
    
    return `${piece}${fromSquare}${captureSymbol}${toSquare}`;
  }

  private coordinatesToSquare(coords: [number, number]): string {
    const [x, y] = coords;
    const file = String.fromCharCode(97 + x); // a-h
    const rank = (8 - y).toString(); // 1-8
    return file + rank;
  }

  async cleanupOldGames(): Promise<void> {
    // Supprimer les parties de plus de 30 jours qui ne sont pas terminées
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.gameRepository
      .createQueryBuilder()
      .delete()
      .where('status != :status AND createdAt < :date', {
        status: 'finished',
        date: thirtyDaysAgo
      })
      .execute();
  }
}