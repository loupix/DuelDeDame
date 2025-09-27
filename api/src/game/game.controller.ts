import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('info/:code')
  async getGameInfo(@Param('code') code: string) {
    return this.gameService.getGameInfo(code);
  }

  @Post('create')
  async createGame(@Body() body: { code?: string }) {
    return this.gameService.createGame(body.code);
  }

  @Get('join/:code')
  async joinGame(@Param('code') code: string) {
    return this.gameService.joinGame(code);
  }
}