import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigifyModule } from '@itgorillaz/configify';
import { LoggerModule } from './config/logger.module';
import { UsersModule } from './users/users.module';
import { PriceModule } from './price/price.module';
import { GuessModule } from './guess/guess.module';
import { PrismaService } from './config/db/prisma.service';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    UsersModule,
    GuessModule,
    PriceModule,
    ConfigifyModule.forRootAsync(),
    LoggerModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
