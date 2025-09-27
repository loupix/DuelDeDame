import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './session.entity';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { GeoipModule } from '../geoip/geoip.module';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity]), GeoipModule],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [SessionService],
})
export class SessionModule {}

