import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // Par défaut on stocke la DB dans api/data
      database: process.env.NEST_DB_SQLITE_PATH || 'data/duel-de-dame.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ChatModule,
    GameModule,
  ],
  providers: [GameGateway],
})
export class AppModule {}
