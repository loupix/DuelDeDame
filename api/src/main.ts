import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.NEST_PORT ? Number(process.env.NEST_PORT) : 3001;
  const corsOrigin = process.env.NEST_CORS_ORIGIN || 'http://localhost:3000';
  app.enableCors({ origin: corsOrigin });
  await app.listen(port);
}
bootstrap();
