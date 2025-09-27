import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './match.entity';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity]), SessionModule],
  providers: [MatchService],
  controllers: [MatchController],
})
export class MatchModule {}

