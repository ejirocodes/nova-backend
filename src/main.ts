import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, AppLoggerService } from './config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const appConfig = app.get(AppConfig);
  app.useGlobalPipes(new ValidationPipe());

  const logger = app.get(AppLoggerService);

  app.enableCors({
    origin: ['http://localhost:5253'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useLogger(logger);
  app.setGlobalPrefix('api/v1');

  const { port, host, nodeEnv } = appConfig;

  await app.listen(port, host, () => {
    logger.log(
      `Server is running in ${nodeEnv} mode on http://${host}:${port}`,
      'Bootstrap',
    );
    logger.log(`Application started successfully`, 'Bootstrap');
  });
}
bootstrap().catch((err) => {
  console.error(`Error starting server: ${err}`);
  process.exit(1);
});
