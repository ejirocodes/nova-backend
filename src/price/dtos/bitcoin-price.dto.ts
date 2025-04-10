import { IsString, IsIn, IsOptional } from 'class-validator';

export class BitcoinPriceQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['24h', '7d', '30d', '90d'], {
    message: 'Time period must be one of: 24h, 7d, 30d, 90d',
  })
  period?: string = '7d';
}
