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
  async handleClerkWebhook(
    // @Headers('svix-id') svixId: string,
    // @Headers('svix-timestamp') svixTimestamp: string,
    // @Headers('svix-signature') svixSignature: string,
    @Body() payload: any,
  ) {
    try {
      if (!this.clerkWebhookSecret) {
        throw new BadRequestException(
          'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env',
        );
      }

      // if (this.clerkWebhookSecret) {
      // this.verifyClerkWebhookSignature(
      //   svixId,
      //   svixTimestamp,
      //   svixSignature,
      //   JSON.stringify(payload),
      // );
      // } else {
      // this.logger.warn(
      //   'CLERK_SIGNING_SECRET not set, skipping signature verification',
      // );
      // }

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

  // private verifyClerkWebhookSignature(
  //   svixId: string,
  //   svixTimestamp: string,
  //   svixSignature: string,
  //   payload: string,
  // ): void {
  //   if (!svixId || !svixTimestamp || !svixSignature) {
  //     throw new Error('Missing Svix headers');
  //   }

  //   const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  //   const signature = crypto
  //     .createHmac('sha256', this.clerkWebhookSecret)
  //     .update(signedContent)
  //     .digest('hex');

  //   const expectedSignature = `v1,${signature}`;
  //   const providedSignatures = svixSignature.split(' ');

  //   console.log('expectedSignature', expectedSignature);
  //   console.log('providedSignatures', providedSignatures);

  //   if (!providedSignatures.includes(expectedSignature)) {
  //     throw new Error('Invalid webhook signature');
  //   }
  // }
}
