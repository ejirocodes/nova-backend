import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from '../config/db/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ClerkWebhookGuard } from './clerk/clerk-webhook.guard';

@Module({
  imports: [UsersModule, ConfigModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService, ClerkWebhookGuard],
  exports: [WebhooksService],
})
export class WebhooksModule {}
