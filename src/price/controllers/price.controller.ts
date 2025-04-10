import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from '../services/price.service';
import { BitcoinPriceQueryDto } from '../dtos/bitcoin-price.dto';
import { BitcoinPriceResponse } from '../interfaces/price.interface';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get()
  async getBitcoinPrice(
    @Query() query: BitcoinPriceQueryDto,
  ): Promise<BitcoinPriceResponse> {
    return await this.priceService.getBitcoinPrice(query.period);
  }
}
