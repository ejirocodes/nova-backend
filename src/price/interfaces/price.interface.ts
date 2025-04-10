import { ApiProperty } from '@nestjs/swagger';

export class BitcoinPriceData {
  @ApiProperty({ type: Number })
  currentPrice: number;
  @ApiProperty({ type: Number })
  priceChange24h: number;
  @ApiProperty({ type: Number })
  percentChange24h: number;
}

export class BitcoinHistoryPoint {
  time: string;
  price: number;
  volume: number;
}

export class BitcoinHistoryData {
  data: BitcoinHistoryPoint[];
}

export class BitcoinPriceResponse {
  @ApiProperty({ type: BitcoinPriceData })
  price: BitcoinPriceData;
  @ApiProperty({ type: BitcoinHistoryData })
  history: BitcoinHistoryData;
}
