import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from './session.entity';
import { GeoipService, GeoData } from '../geoip/geoip.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repo: Repository<SessionEntity>,
    private readonly geoipService: GeoipService,
  ) {}

  async findOrCreateByIdentity(
    identity: string,
    firstName?: string,
    lastName?: string,
    extras?: { avatarColor?: string; countryCode?: string; language?: string; timezone?: string },
    clientIp?: string
  ): Promise<SessionEntity> {
    let session = await this.repo.findOne({ where: { identity } });
    if (!session) {
      // Enrichir avec géolocalisation IP si disponible
      let geoData: GeoData = {};
      if (clientIp) {
        geoData = await this.geoipService.getGeoData(clientIp);
      }
      
      session = this.repo.create({
        identity,
        firstName: firstName || null,
        lastName: lastName || null,
        avatarColor: extras?.avatarColor || null,
        countryCode: extras?.countryCode || geoData.countryCode || null,
        language: extras?.language || geoData.language || null,
        timezone: extras?.timezone || geoData.timezone || null,
      });
      session = await this.repo.save(session);
    } else {
      let changed = false;
      if (firstName && session.firstName !== firstName) { session.firstName = firstName; changed = true; }
      if (lastName && session.lastName !== lastName) { session.lastName = lastName; changed = true; }
      if (extras?.avatarColor && session.avatarColor !== extras.avatarColor) { session.avatarColor = extras.avatarColor; changed = true; }
      if (extras?.countryCode && session.countryCode !== extras.countryCode) { session.countryCode = extras.countryCode; changed = true; }
      if (extras?.language && session.language !== extras.language) { session.language = extras.language; changed = true; }
      if (extras?.timezone && session.timezone !== extras.timezone) { session.timezone = extras.timezone; changed = true; }
      if (changed) session = await this.repo.save(session);
    }
    return session;
  }

  async findByIdentity(identity: string): Promise<SessionEntity | null> {
    return this.repo.findOne({ where: { identity } });
  }
}

