import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { GameService, CreateGameDto, JoinGameDto } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  async createGame(@Body() body: { code?: string; playerId: string }) {
    try {
      const game = await this.gameService.create(body);
      return {
        success: true,
        game,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('join')
  async joinGame(@Body() body: { code: string; playerId: string }) {
    try {
      const game = await this.gameService.joinGame(body);
      return {
        success: true,
        game,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':code')
  async getGame(@Param('code') code: string) {
    try {
      const game = await this.gameService.getGameByCode(code);
      if (!game) {
        return {
          success: false,
          error: 'Partie non trouvée',
        };
      }
      return {
        success: true,
        game,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put(':code/state')
  async updateGameState(
    @Param('code') code: string,
    @Body() body: { 
      status?: 'waiting' | 'active' | 'finished';
      currentTurn?: 'white' | 'black';
      boardState?: string;
      moveCount?: number;
    }
  ) {
    try {
      const game = await this.gameService.updateGameState(code, body);
      return {
        success: true,
        game,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put(':code/finish')
  async finishGame(
    @Param('code') code: string,
    @Body() body: { winner?: 'white' | 'black' }
  ) {
    try {
      const game = await this.gameService.finishGame(code, body.winner);
      return {
        success: true,
        game,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('player/:playerId/active')
  async getActiveGamesByPlayer(@Param('playerId') playerId: string) {
    try {
      const games = await this.gameService.getActiveGamesByPlayer(playerId);
      return {
        success: true,
        games,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}