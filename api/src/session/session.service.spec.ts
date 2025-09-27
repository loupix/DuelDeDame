import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionService } from './session.service';
import { SessionEntity } from './session.entity';
import { GeoipService } from '../geoip/geoip.service';

describe('SessionService', () => {
  let service: SessionService;
  let repository: Repository<SessionEntity>;
  let geoipService: GeoipService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGeoipService = {
    getGeoData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: mockRepository,
        },
        {
          provide: GeoipService,
          useValue: mockGeoipService,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    repository = module.get<Repository<SessionEntity>>(getRepositoryToken(SessionEntity));
    geoipService = module.get<GeoipService>(GeoipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOrCreateByIdentity', () => {
    it('devrait créer une nouvelle session si elle n\'existe pas', async () => {
      const identity = 'test-identity';
      const firstName = 'John';
      const lastName = 'Doe';
      const clientIp = '192.168.1.1';

      mockRepository.findOne.mockResolvedValue(null);
      mockGeoipService.getGeoData.mockResolvedValue({
        countryCode: 'FR',
        timezone: 'Europe/Paris',
        language: 'fr-FR',
      });

      const mockSession = {
        id: 'session-id',
        identity,
        firstName,
        lastName,
        avatarColor: '#ff0000',
        countryCode: 'FR',
        language: 'fr-FR',
        timezone: 'Europe/Paris',
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockSession);
      mockRepository.save.mockResolvedValue(mockSession);

      const result = await service.findOrCreateByIdentity(
        identity,
        firstName,
        lastName,
        { avatarColor: '#ff0000' },
        clientIp
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { identity } });
      expect(mockGeoipService.getGeoData).toHaveBeenCalledWith(clientIp);
      expect(mockRepository.create).toHaveBeenCalledWith({
        identity,
        firstName,
        lastName,
        avatarColor: '#ff0000',
        countryCode: 'FR',
        language: 'fr-FR',
        timezone: 'Europe/Paris',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockSession);
      expect(result).toEqual(mockSession);
    });

    it('devrait retourner la session existante si elle existe', async () => {
      const identity = 'test-identity';
      const existingSession = {
        id: 'session-id',
        identity,
        firstName: 'John',
        lastName: 'Doe',
        avatarColor: '#ff0000',
        countryCode: 'FR',
        language: 'fr-FR',
        timezone: 'Europe/Paris',
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingSession);

      const result = await service.findOrCreateByIdentity(identity);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { identity } });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(existingSession);
    });

    it('devrait mettre à jour la session existante si les données changent', async () => {
      const identity = 'test-identity';
      const existingSession = {
        id: 'session-id',
        identity,
        firstName: 'John',
        lastName: 'Doe',
        avatarColor: '#ff0000',
        countryCode: 'FR',
        language: 'fr-FR',
        timezone: 'Europe/Paris',
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingSession);
      mockRepository.save.mockResolvedValue(existingSession);

      const result = await service.findOrCreateByIdentity(
        identity,
        'Jane',
        'Smith',
        { avatarColor: '#00ff00' }
      );

      expect(existingSession.firstName).toBe('Jane');
      expect(existingSession.lastName).toBe('Smith');
      expect(existingSession.avatarColor).toBe('#00ff00');
      expect(mockRepository.save).toHaveBeenCalledWith(existingSession);
      expect(result).toEqual(existingSession);
    });
  });

  describe('findByIdentity', () => {
    it('devrait retourner la session si elle existe', async () => {
      const identity = 'test-identity';
      const session = { id: 'session-id', identity };

      mockRepository.findOne.mockResolvedValue(session);

      const result = await service.findByIdentity(identity);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { identity } });
      expect(result).toEqual(session);
    });

    it('devrait retourner null si la session n\'existe pas', async () => {
      const identity = 'test-identity';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByIdentity(identity);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { identity } });
      expect(result).toBeNull();
    });
  });
});