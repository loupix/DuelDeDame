import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './game.entity';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEntity]),
    SessionModule,
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}