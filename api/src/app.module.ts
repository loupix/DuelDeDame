import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GameGateway } from './game.gateway';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [GameGateway],
})
export class AppModule {}
