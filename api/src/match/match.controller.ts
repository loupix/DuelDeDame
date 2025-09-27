import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MatchService } from './match.service';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  async create(@Body() body: { identity: string; code: string; result: 'win' | 'loss' | 'draw'; color: 'white' | 'black'; duration: number; moves: number; }) {
    const match = await this.matchService.create(body);
    return {
      id: match.id,
      code: match.code,
      result: match.result,
      color: match.color,
      duration: match.duration,
      moves: match.moves,
      createdAt: match.createdAt,
    };
  }

  @Get()
  async list(@Query('identity') identity: string) {
    const matches = await this.matchService.listByIdentity(identity);
    return matches.map(m => ({
      id: m.id,
      code: m.code,
      result: m.result,
      color: m.color,
      duration: m.duration,
      moves: m.moves,
      createdAt: m.createdAt,
    }));
  }
}

