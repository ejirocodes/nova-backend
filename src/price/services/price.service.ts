import { ASSETS } from './../../common/api/constants/assets.const';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  BitcoinPriceData,
  BitcoinHistoryPoint,
  BitcoinPriceResponse,
} from '../interfaces/price.interface';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AppConfig } from '../../config/app.config';
import { BitcoinPricePeriod } from '../dtos/bitcoin-price.dto';
@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly apiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfig: AppConfig,
  ) {
    this.apiBaseUrl = this.appConfig.cryptocurrencyApiUrl;
  }

  async getBitcoinPrice(
    period: BitcoinPricePeriod = BitcoinPricePeriod['7d'],
  ): Promise<BitcoinPriceResponse> {
    try {
      const currentPriceUrl = `${this.apiBaseUrl}/coins/${ASSETS.BITCOIN.ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      const currentPriceResponse = await firstValueFrom(
        this.httpService.get(currentPriceUrl),
      );

      const priceData: BitcoinPriceData = {
        currentPrice: currentPriceResponse.data.market_data.current_price.usd,
        priceChange24h:
          currentPriceResponse.data.market_data.price_change_24h || 0,
        percentChange24h:
          currentPriceResponse.data.market_data.price_change_percentage_24h ||
          0,
      };

      const days = period.replace('d', '');
      const historyUrl = `${this.apiBaseUrl}/coins/${ASSETS.BITCOIN.ID}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
      const historyResponse = await firstValueFrom(
        this.httpService.get(historyUrl),
      );

      const formattedData: BitcoinHistoryPoint[] = [];

      if (
        historyResponse.data.prices &&
        historyResponse.data.prices.length > 0
      ) {
        historyResponse.data.prices.forEach(
          (item: [number, number], index: number) => {
            formattedData.push({
              time: new Date(item[0]).toISOString(),
              price: item[1],
              volume: historyResponse.data.total_volumes[index]?.[1] || 0,
            });
          },
        );
      }

      return {
        price: priceData,
        history: { data: formattedData },
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch Bitcoin price data -> ${error.message}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        `Failed to fetch Bitcoin price data -> ${error.message}`,
      );
    }
  }
}
