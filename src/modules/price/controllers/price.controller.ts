import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from '../services/price.service';
import { BitcoinPriceQueryDto } from './../dtos/bitcoin-price.dto';
import { BitcoinPriceResponse } from './../interfaces/price.interface';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Price')
@Controller('price')
@Auth()
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get()
  @ApiOperation({ summary: 'Get Bitcoin price' })
  @ApiResponse({ type: BitcoinPriceResponse })
  async getBitcoinPrice(
    @Query() query: BitcoinPriceQueryDto,
  ): Promise<BitcoinPriceResponse> {
    return await this.priceService.getBitcoinPrice(query.period);
  }
}
