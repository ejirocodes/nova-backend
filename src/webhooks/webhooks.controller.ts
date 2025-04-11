import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { ConfigService } from '@nestjs/config';
import { ClerkWebhookGuard } from './clerk/clerk-webhook.guard';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private readonly clerkWebhookSecret: string;

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {
    this.clerkWebhookSecret = this.configService.get<string>(
      'CLERK_SIGNING_SECRET',
    );
  }

  @Post('clerk')
  @UseGuards(ClerkWebhookGuard)
  async handleClerkWebhook(@Body() payload: any) {
    try {
      if (!this.clerkWebhookSecret) {
        throw new BadRequestException(
          'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env',
        );
      }

      const { type } = payload;
      this.logger.log(`Received Clerk webhook: ${type}`);

      switch (type) {
        case 'user.created':
          this.logger.log(`Processing user.created: ${payload}`);
          await this.webhooksService.handleClerkUserCreated(payload);
          break;
        case 'user.updated':
          this.logger.log(`Processing user.updated: ${payload}`);
          await this.webhooksService.handleClerkUserUpdated(payload);
          break;
        default:
          this.logger.log(`Unhandled Clerk webhook type: ${type}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error processing Clerk webhook: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
