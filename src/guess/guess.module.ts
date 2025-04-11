import { Module } from '@nestjs/common';

import { GuessController } from './controllers/guess.controller';
import { GuessService } from './services/guess.service';
import { PriceModule } from '../price/price.module';
import { PrismaService } from '../config/db/ prisma.service';

@Module({
  imports: [PriceModule],
  controllers: [GuessController],
  providers: [GuessService, PrismaService],
  exports: [GuessService],
})
export class GuessModule {}
