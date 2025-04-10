import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Webhook, WebhookRequiredHeaders } from 'svix';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const rawBody = req.body;
    const headers = req.headers as unknown as WebhookRequiredHeaders;

    const secret = this.configService.get<string>('CLERK_SIGNING_SECRET');
    if (!secret)
      throw new UnauthorizedException('Missing Clerk Webhook Secret');

    try {
      const webhook = new Webhook(secret);
      webhook.verify(JSON.stringify(rawBody), headers);
      return true;
    } catch (error) {
      console.error('Clerk Webhook Verification Failed:', error.message);
      throw new UnauthorizedException('Invalid Clerk Webhook Signature');
    }
  }
}
