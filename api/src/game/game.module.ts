import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './game.entity';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from '../game.gateway';
import { SessionModule } from '../session/session.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEntity]),
    SessionModule,
    ChatModule,
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}