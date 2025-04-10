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
  @ApiProperty({ type: String })
  time: string;
  @ApiProperty({ type: Number })
  price: number;
  @ApiProperty({ type: Number })
  volume: number;
}

export class BitcoinHistoryData {
  @ApiProperty({ type: [BitcoinHistoryPoint] })
  data: BitcoinHistoryPoint[];
}

export class BitcoinPriceResponse {
  @ApiProperty({ type: BitcoinPriceData })
  price: BitcoinPriceData;
  @ApiProperty({ type: BitcoinHistoryData })
  history: BitcoinHistoryData;
}
