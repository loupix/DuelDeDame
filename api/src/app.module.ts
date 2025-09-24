import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { GameService } from './services/game.service';
import { GameController } from './controllers/game.controller';
import { Game } from './entities/game.entity';
import { Move } from './entities/move.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'games.db',
      entities: [Game, Move],
      synchronize: true, // En production, utiliser des migrations
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Game, Move]),
  ],
  controllers: [GameController],
  providers: [GameGateway, GameService],
})
export class AppModule {}
