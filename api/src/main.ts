import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.NEST_PORT ? Number(process.env.NEST_PORT) : 3001;
  const corsOrigin = process.env.NEST_CORS_ORIGIN;
  // Par défaut: autoriser toutes origines (public). Si NEST_CORS_ORIGIN est défini, on l'utilise.
  app.enableCors({ origin: corsOrigin ? corsOrigin : true });
  await app.listen(port, '0.0.0.0');
}
bootstrap();
