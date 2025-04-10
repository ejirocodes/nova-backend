import { UseGuards, applyDecorators } from '@nestjs/common';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';

export function Auth() {
  return applyDecorators(UseGuards(ClerkAuthGuard));
}
