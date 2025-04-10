import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigifyModule } from '@itgorillaz/configify';
import { LoggerModule } from './config/logger.module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UsersModule } from './users/users.module';
import { PriceModule } from './price/price.module';

@Module({
  imports: [
    UsersModule,
    PriceModule,
    ConfigifyModule.forRootAsync(),
    DynamooseModule.forRootAsync({
      useFactory: () => {
        return {
          aws: {
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
          local: process.env.NODE_ENV === 'development',
          endpoint: process.env.DYNAMODB_ENDPOINT,
          logger: process.env.NODE_ENV === 'development' ? console : undefined,
          clientConfig: {
            maxAttempts: 5,
            retryMode: 'standard',
          },
          customEndpoint: process.env.DYNAMODB_ENDPOINT,
        };
      },
    }),
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
