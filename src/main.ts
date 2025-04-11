import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, AppLoggerService } from './config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    const appConfig = app.get(AppConfig);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        skipMissingProperties: false,
      }),
    );

    const logger = app.get(AppLoggerService);

    app.enableCors({
      origin: ['http://localhost:5255'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useLogger(logger);
    app.setGlobalPrefix('api/v1');

    const config = new DocumentBuilder()
      .setTitle('Nova backend')
      .setDescription('The backend API of Nova')
      .setVersion('1.0')
      .addTag('nova')
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/v1/docs', app, documentFactory);

    const { port, host, nodeEnv } = appConfig;

    logger.log(
      `AWS Configuration - Region: ${appConfig.awsRegion}, Has AccessKeyId: ${!!appConfig.awsAccessKeyId}, Has SecretAccessKey: ${!!appConfig.awsSecretAccessKey}`,
      'Bootstrap',
    );

    await app.listen(port, host, () => {
      logger.log(
        `Server is running in ${nodeEnv} mode on http://${host}:${port}`,
        'Bootstrap',
      );
      logger.log(`Application started successfully`, 'Bootstrap');
    });
  } catch (err) {
    console.error(`Error starting server:`, err);
    process.exit(1);
  }
}

bootstrap();
