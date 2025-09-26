import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history/:gameCode')
  async history(
    @Param('gameCode') gameCode: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? Math.min(parseInt(limit, 10) || 100, 500) : 100;
    const result = await this.chatService.listByGameCode(gameCode, limitNum);
    return result.map(m => ({
      id: m.id,
      gameCode: m.gameCode,
      message: m.message,
      sender: m.sender,
      isPredefined: m.isPredefined,
      predefinedColor: m.predefinedColor || undefined,
      timestamp: m.createdAt,
    }));
  }
}

