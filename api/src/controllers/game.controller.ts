import { Controller, Get, Param, Query } from '@nestjs/common';
import { GameService } from '../services/game.service';

@Controller('api/games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('replay/:code')
  async getGameReplay(@Param('code') code: string) {
    const replay = await this.gameService.getGameReplay(code);
    if (!replay) {
      return { error: 'Partie non trouvée' };
    }

    return {
      success: true,
      data: {
        game: {
          id: replay.game.id,
          code: replay.game.code,
          status: replay.game.status,
          winner: replay.game.winner,
          moveCount: replay.game.moveCount,
          duration: replay.game.duration,
          whitePlayerName: replay.game.whitePlayerName,
          blackPlayerName: replay.game.blackPlayerName,
          createdAt: replay.game.createdAt,
          updatedAt: replay.game.updatedAt,
        },
        moves: replay.moves.map(move => ({
          id: move.id,
          player: move.player,
          from: [move.fromX, move.fromY],
          to: [move.toX, move.toY],
          piece: move.piece,
          isCapture: move.isCapture,
          isPromotion: move.isPromotion,
          moveNumber: move.moveNumber,
          notation: move.notation,
          timestamp: move.timestamp,
        }))
      }
    };
  }

  @Get('recent')
  async getRecentGames(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const games = await this.gameService.getRecentGames(limitNumber);

    return {
      success: true,
      data: games.map(game => ({
        id: game.id,
        code: game.code,
        status: game.status,
        winner: game.winner,
        moveCount: game.moveCount,
        duration: game.duration,
        whitePlayerName: game.whitePlayerName,
        blackPlayerName: game.blackPlayerName,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      }))
    };
  }

  @Get('player/:playerId')
  async getPlayerGames(@Param('playerId') playerId: string, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const games = await this.gameService.getPlayerGames(playerId, limitNumber);

    return {
      success: true,
      data: games.map(game => ({
        id: game.id,
        code: game.code,
        status: game.status,
        winner: game.winner,
        moveCount: game.moveCount,
        duration: game.duration,
        whitePlayerName: game.whitePlayerName,
        blackPlayerName: game.blackPlayerName,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      }))
    };
  }

  @Get('stats')
  async getGameStats() {
    // Cette méthode pourrait être étendue pour fournir des statistiques globales
    const recentGames = await this.gameService.getRecentGames(100);
    
    const stats = {
      totalGames: recentGames.length,
      finishedGames: recentGames.filter(g => g.status === 'finished').length,
      whiteWins: recentGames.filter(g => g.winner === 'white').length,
      blackWins: recentGames.filter(g => g.winner === 'black').length,
      averageDuration: recentGames.length > 0 
        ? Math.round(recentGames.reduce((sum, g) => sum + g.duration, 0) / recentGames.length)
        : 0,
      averageMoves: recentGames.length > 0
        ? Math.round(recentGames.reduce((sum, g) => sum + g.moveCount, 0) / recentGames.length)
        : 0,
    };

    return {
      success: true,
      data: stats
    };
  }
}