import { DataSource } from 'typeorm';
import { SessionEntity } from '../src/session/session.entity';
import { MatchEntity } from '../src/match/match.entity';
import { ChatMessageEntity } from '../src/chat/chat.entity';

export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [SessionEntity, MatchEntity, ChatMessageEntity],
  synchronize: true,
  logging: false,
});

beforeAll(async () => {
  await testDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});

beforeEach(async () => {
  // Nettoyer les tables avant chaque test
  await testDataSource.getRepository(SessionEntity).clear();
  await testDataSource.getRepository(MatchEntity).clear();
  await testDataSource.getRepository(ChatMessageEntity).clear();
});