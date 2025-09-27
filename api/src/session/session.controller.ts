import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { SessionService } from './session.service';
import { Request } from 'express';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createOrGet(@Body() body: CreateSessionDto, @Req() req: Request) {
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const session = await this.sessionService.findOrCreateByIdentity(
      body.identity,
      body.firstName,
      body.lastName,
      { avatarColor: body.avatarColor, countryCode: body.countryCode, language: body.language, timezone: body.timezone },
      clientIp
    );
    return {
      id: session.id,
      identity: session.identity,
      firstName: session.firstName,
      lastName: session.lastName,
      avatarColor: session.avatarColor,
      countryCode: session.countryCode,
      language: session.language,
      timezone: session.timezone,
      createdAt: session.createdAt
    };
  }

  @Get('health')
  health() {
    return { ok: true };
  }
}

