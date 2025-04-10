export interface BitcoinPriceData {
  currentPrice: number;
  priceChange24h: number;
  percentChange24h: number;
}

export interface BitcoinHistoryPoint {
  time: string;
  price: number;
  volume: number;
}

export interface BitcoinHistoryData {
  data: BitcoinHistoryPoint[];
}

export interface BitcoinPriceResponse {
  price: BitcoinPriceData;
  history: BitcoinHistoryData;
}
