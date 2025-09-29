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
    try {
      // Essayer de trouver la session existante
    let session = await this.repo.findOne({ where: { identity } });
      if (session) {
        // Mettre à jour la session existante si nécessaire
        let changed = false;
        if (firstName && session.firstName !== firstName) { session.firstName = firstName; changed = true; }
        if (lastName && session.lastName !== lastName) { session.lastName = lastName; changed = true; }
        if (extras?.avatarColor && session.avatarColor !== extras.avatarColor) { session.avatarColor = extras.avatarColor; changed = true; }
        if (extras?.countryCode && session.countryCode !== extras.countryCode) { session.countryCode = extras.countryCode; changed = true; }
        if (extras?.language && session.language !== extras.language) { session.language = extras.language; changed = true; }
        if (extras?.timezone && session.timezone !== extras.timezone) { session.timezone = extras.timezone; changed = true; }
        if (changed) session = await this.repo.save(session);
        return session;
      }

      // Enrichir avec géolocalisation IP si disponible
      let geoData: GeoData = {};
      if (clientIp) {
        geoData = await this.geoipService.getGeoData(clientIp);
      }
      
      // Créer une nouvelle session
      session = this.repo.create({
        identity,
        firstName: firstName || null,
        lastName: lastName || null,
        avatarColor: extras?.avatarColor || null,
        countryCode: extras?.countryCode || geoData.countryCode || null,
        language: extras?.language || geoData.language || null,
        timezone: extras?.timezone || geoData.timezone || null,
      });
      
      return await this.repo.save(session);
    } catch (error) {
      // Si la contrainte UNIQUE échoue, essayer de récupérer la session existante
      if (error.code === 'SQLITE_CONSTRAINT' || 
          (error.message && error.message.includes('UNIQUE constraint failed: sessions.identity'))) {
        console.log('Contrainte UNIQUE détectée, tentative de récupération de la session existante...');
        try {
          const existingSession = await this.repo.findOne({ where: { identity } });
          if (existingSession) {
            console.log('Session existante trouvée:', existingSession.id);
            return existingSession;
    } else {
            console.log('Aucune session existante trouvée, réessayer la création...');
            // Réessayer la création une seule fois
            try {
              const retrySession = this.repo.create({
                identity,
                firstName: firstName || null,
                lastName: lastName || null,
                avatarColor: extras?.avatarColor || null,
                countryCode: extras?.countryCode || null,
                language: extras?.language || null,
                timezone: extras?.timezone || null,
              });
              return await this.repo.save(retrySession);
            } catch (retryError) {
              console.error('Erreur lors du retry de création:', retryError);
              throw retryError;
            }
          }
        } catch (findError) {
          console.error('Erreur lors de la récupération de la session existante:', findError);
          throw findError;
        }
      }
      console.error('Erreur lors de la création/récupération de session:', error);
      throw error;
    }
  }

  async findByIdentity(identity: string): Promise<SessionEntity | null> {
    return this.repo.findOne({ where: { identity } });
  }
}

