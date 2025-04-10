import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum BitcoinPricePeriod {
  '24h' = '24h',
  '7d' = '7d',
  '30d' = '30d',
  '90d' = '90d',
}

export class BitcoinPriceQueryDto {
  @ApiProperty({
    enum: BitcoinPricePeriod,
    default: BitcoinPricePeriod['7d'],
    enumName: 'BitcoinPricePeriod',
  })
  @IsOptional()
  @IsString()
  @IsEnum(BitcoinPricePeriod, {
    message: 'Time period must be one of: 24h, 7d, 30d, 90d',
  })
  period?: BitcoinPricePeriod = BitcoinPricePeriod['7d'];
}
