import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchService } from './match.service';
import { MatchEntity } from './match.entity';
import { SessionService } from '../session/session.service';

describe('MatchService', () => {
  let service: MatchService;
  let repository: Repository<MatchEntity>;
  let sessionService: SessionService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockSessionService = {
    findOrCreateByIdentity: jest.fn(),
    findByIdentity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: getRepositoryToken(MatchEntity),
          useValue: mockRepository,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    repository = module.get<Repository<MatchEntity>>(getRepositoryToken(MatchEntity));
    sessionService = module.get<SessionService>(SessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer un nouveau match', async () => {
      const createMatchDto = {
        identity: 'test-identity',
        code: 'ABC123',
        result: 'win' as const,
        color: 'white' as const,
        duration: 300,
        moves: 25,
      };

      const mockSession = {
        id: 'session-id',
        identity: 'test-identity',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockMatch = {
        id: 'match-id',
        code: 'ABC123',
        result: 'win',
        color: 'white',
        duration: 300,
        moves: 25,
        session: mockSession,
        createdAt: new Date(),
      };

      mockSessionService.findOrCreateByIdentity.mockResolvedValue(mockSession);
      mockRepository.create.mockReturnValue(mockMatch);
      mockRepository.save.mockResolvedValue(mockMatch);

      const result = await service.create(createMatchDto);

      expect(mockSessionService.findOrCreateByIdentity).toHaveBeenCalledWith('test-identity');
      expect(mockRepository.create).toHaveBeenCalledWith({
        code: 'ABC123',
        result: 'win',
        color: 'white',
        duration: 300,
        moves: 25,
        session: mockSession,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockMatch);
      expect(result).toEqual(mockMatch);
    });
  });

  describe('listByIdentity', () => {
    it('devrait retourner la liste des matchs pour une identité', async () => {
      const identity = 'test-identity';
      const mockSession = {
        id: 'session-id',
        identity: 'test-identity',
      };

      const mockMatches = [
        {
          id: 'match-1',
          code: 'ABC123',
          result: 'win',
          color: 'white',
          duration: 300,
          moves: 25,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'match-2',
          code: 'DEF456',
          result: 'loss',
          color: 'black',
          duration: 450,
          moves: 30,
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockSessionService.findByIdentity.mockResolvedValue(mockSession);
      mockRepository.find.mockResolvedValue(mockMatches);

      const result = await service.listByIdentity(identity);

      expect(mockSessionService.findByIdentity).toHaveBeenCalledWith(identity);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { session: { id: 'session-id' } },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockMatches);
    });

    it('devrait retourner un tableau vide si la session n\'existe pas', async () => {
      const identity = 'test-identity';

      mockSessionService.findByIdentity.mockResolvedValue(null);

      const result = await service.listByIdentity(identity);

      expect(mockSessionService.findByIdentity).toHaveBeenCalledWith(identity);
      expect(mockRepository.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});