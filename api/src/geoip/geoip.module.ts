import { Module } from '@nestjs/common';
import { GeoipService } from './geoip.service';

@Module({
  providers: [GeoipService],
  exports: [GeoipService],
})
export class GeoipModule {}