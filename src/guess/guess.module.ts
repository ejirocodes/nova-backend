import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { GuessController } from './controllers/guess.controller';
import { GuessService } from './services/guess.service';
import { ResolutionService } from './services/resolution.service';
import { PriceModule } from '../price/price.module';
import { PrismaService } from '../config/db/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PriceModule, AuthModule, ConfigModule, ScheduleModule.forRoot()],
  controllers: [GuessController],
  providers: [GuessService, ResolutionService, PrismaService],
  exports: [GuessService],
})
export class GuessModule {}
