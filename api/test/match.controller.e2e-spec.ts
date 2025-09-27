import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { MatchModule } from '../src/match/match.module';
import { SessionModule } from '../src/session/session.module';
import { MatchEntity } from '../src/match/match.entity';
import { SessionEntity } from '../src/session/session.entity';
import { GeoipModule } from '../src/geoip/geoip.module';

describe('MatchController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [MatchEntity, SessionEntity],
          synchronize: true,
          logging: false,
        }),
        SessionModule,
        MatchModule,
        GeoipModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await dataSource.getRepository(MatchEntity).clear();
    await dataSource.getRepository(SessionEntity).clear();
  });

  describe('/matches (POST)', () => {
    it('devrait créer un nouveau match', async () => {
      const createMatchDto = {
        identity: 'test-identity',
        code: 'ABC123',
        result: 'win',
        color: 'white',
        duration: 300,
        moves: 25,
      };

      const response = await request(app.getHttpServer())
        .post('/matches')
        .send(createMatchDto)
        .expect(201);

      expect(response.body).toMatchObject({
        code: 'ABC123',
        result: 'win',
        color: 'white',
        duration: 300,
        moves: 25,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('devrait créer une session automatiquement si elle n\'existe pas', async () => {
      const createMatchDto = {
        identity: 'new-identity',
        code: 'DEF456',
        result: 'loss',
        color: 'black',
        duration: 450,
        moves: 30,
      };

      const response = await request(app.getHttpServer())
        .post('/matches')
        .send(createMatchDto)
        .expect(201);

      expect(response.body.code).toBe('DEF456');
      expect(response.body.result).toBe('loss');
    });
  });

  describe('/matches (GET)', () => {
    it('devrait retourner la liste des matchs pour une identité', async () => {
      // Créer d'abord une session
      await request(app.getHttpServer())
        .post('/sessions')
        .send({
          identity: 'test-identity',
          firstName: 'John',
          lastName: 'Doe',
        });

      // Créer quelques matchs
      await request(app.getHttpServer())
        .post('/matches')
        .send({
          identity: 'test-identity',
          code: 'ABC123',
          result: 'win',
          color: 'white',
          duration: 300,
          moves: 25,
        });

      await request(app.getHttpServer())
        .post('/matches')
        .send({
          identity: 'test-identity',
          code: 'DEF456',
          result: 'loss',
          color: 'black',
          duration: 450,
          moves: 30,
        });

      const response = await request(app.getHttpServer())
        .get('/matches?identity=test-identity')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        code: 'DEF456',
        result: 'loss',
        color: 'black',
      });
      expect(response.body[1]).toMatchObject({
        code: 'ABC123',
        result: 'win',
        color: 'white',
      });
    });

    it('devrait retourner un tableau vide si l\'identité n\'existe pas', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches?identity=non-existent')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});