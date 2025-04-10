import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { UserModel } from '../users/models/user.model';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService, UserModel],
  exports: [WebhooksService],
})
export class WebhooksModule {}
