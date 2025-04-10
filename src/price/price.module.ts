import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PriceController } from './controllers/price.controller';
import { PriceService } from './services/price.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PriceController],
  providers: [PriceService],
  exports: [PriceService],
})
export class PriceModule {}
