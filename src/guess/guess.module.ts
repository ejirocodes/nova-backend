import { Module } from '@nestjs/common';

import { GuessController } from './controllers/guess.controller';
import { GuessService } from './services/guess.service';
import { PriceModule } from '../price/price.module';
import { PrismaService } from '../config/db/ prisma.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PriceModule, AuthModule, ConfigModule],
  controllers: [GuessController],
  providers: [GuessService, PrismaService],
  exports: [GuessService],
})
export class GuessModule {}
