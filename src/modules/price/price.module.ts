import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PriceController } from './controllers/price.controller';
import { PriceService } from './services/price.service';
import { PrismaService } from 'src/config/db/prisma.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PriceController],
  providers: [PriceService, PrismaService],
  exports: [PriceService],
})
export class PriceModule {}
