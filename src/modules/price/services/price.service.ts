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
import { BitcoinPricePeriod } from '../dtos/bitcoin-price.dto';
import { AppConfig } from 'src/config/app.config';
import { ASSETS } from 'src/common/api/constants/assets.const';
import { AxiosError } from 'axios';
import { PrismaService } from 'src/config/db/prisma.service';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly apiBaseUrl: string;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfig: AppConfig,
    private readonly prisma: PrismaService,
  ) {
    this.apiBaseUrl = this.appConfig.cryptocurrencyApiUrl;
  }

  async getBitcoinPrice(
    period: BitcoinPricePeriod = BitcoinPricePeriod['7d'],
  ): Promise<BitcoinPriceResponse> {
    try {
      this.logger.log(
        `Fetching fresh Bitcoin price data for period -> ${period}`,
      );
      return await this.fetchAndCacheBitcoinPrice(period);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          this.logger.warn(
            'Rate limited by API, attempting to use cached data',
          );
          const cachedData = await this.getCachedPriceData(period);
          if (cachedData) {
            this.logger.log(
              `Using valid cached Bitcoin price data for period -> ${period}`,
            );
            return cachedData;
          }

          const lastCachedData = await this.getLastCachedData(period);
          if (lastCachedData) {
            this.logger.log(
              `Using expired cached Bitcoin price data for period -> ${period}`,
            );
            return lastCachedData;
          }

          this.logger.error(`No cached data available for period -> ${period}`);
          throw new ServiceUnavailableException(
            `No cached data available for period -> ${period}`,
          );
        }
      }

      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch Bitcoin price data -> ${error.message}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        `Failed to fetch Bitcoin price data -> ${error.message}`,
      );
    }
  }

  private async getCachedPriceData(
    period: BitcoinPricePeriod,
  ): Promise<BitcoinPriceResponse | null> {
    this.logger.debug(
      `Looking for cached Bitcoin price data for period -> ${period}`,
    );
    const cachedPrice = await this.prisma.price.findFirst({
      where: {
        asset: ASSETS.BITCOIN.ID,
        period,
        expiresAt: { gt: new Date() },
        historyData: { not: null },
      },
      orderBy: { timestamp: 'desc' },
    });

    if (!cachedPrice || !cachedPrice.historyData) {
      this.logger.debug(`No valid cached data found for period -> ${period}`);
      return null;
    }

    this.logger.debug(
      `Found valid cached data from -> ${cachedPrice.timestamp}`,
    );
    return {
      price: {
        currentPrice: cachedPrice.value,
        priceChange24h: cachedPrice.priceChange24h || 0,
        percentChange24h: cachedPrice.percentChange24h || 0,
      },
      history: cachedPrice.historyData as any,
    };
  }

  private async fetchAndCacheBitcoinPrice(
    period: BitcoinPricePeriod,
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

      const response: BitcoinPriceResponse = {
        price: priceData,
        history: { data: formattedData },
      };

      await this.cacheResponseData(response, period);

      return response;
    } catch (error) {
      throw error;
    }
  }

  private async cacheResponseData(
    response: BitcoinPriceResponse,
    period: BitcoinPricePeriod,
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + this.CACHE_TTL);

      await this.prisma.price.create({
        data: {
          asset: ASSETS.BITCOIN.ID,
          value: response.price.currentPrice,
          priceChange24h: response.price.priceChange24h,
          percentChange24h: response.price.percentChange24h,
          period,
          historyData: response.history as any,
          expiresAt,
        },
      });

      this.logger.log(
        `Cached Bitcoin price data for period -> ${period}, expires -> ${expiresAt.toISOString()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to cache price data: ${error.message}`,
        error.stack,
      );
    }
  }

  private async getLastCachedData(
    period: BitcoinPricePeriod,
  ): Promise<BitcoinPriceResponse | null> {
    const lastCachedPrice = await this.prisma.price.findFirst({
      where: {
        asset: ASSETS.BITCOIN.ID,
        period,
        historyData: { not: null },
      },
      orderBy: { timestamp: 'desc' },
    });

    if (!lastCachedPrice || !lastCachedPrice.historyData) {
      return null;
    }

    if (lastCachedPrice.expiresAt && lastCachedPrice.expiresAt < new Date()) {
      this.logger.warn(
        `Using expired cache data from ${lastCachedPrice.timestamp}`,
      );
    }

    return {
      price: {
        currentPrice: lastCachedPrice.value,
        priceChange24h: lastCachedPrice.priceChange24h || 0,
        percentChange24h: lastCachedPrice.percentChange24h || 0,
      },
      history: lastCachedPrice.historyData as any,
    };
  }

  async getLatestBitcoinPrice(): Promise<number> {
    try {
      this.logger.log('Fetching fresh Bitcoin price');
      const currentPriceUrl = `${this.apiBaseUrl}/coins/${ASSETS.BITCOIN.ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      const currentPriceResponse = await firstValueFrom(
        this.httpService.get(currentPriceUrl),
      );

      const price = currentPriceResponse.data.market_data.current_price.usd;

      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + this.CACHE_TTL);

      await this.prisma.price.create({
        data: {
          asset: ASSETS.BITCOIN.ID,
          value: price,
          expiresAt,
        },
      });

      this.logger.log(`Cached latest Bitcoin price -> $${price}`);

      return price;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 429) {
        this.logger.warn(
          'Rate limited by API, attempting to use last cached price',
        );
        const cachedPrice = await this.prisma.price.findFirst({
          where: {
            asset: ASSETS.BITCOIN.ID,
            expiresAt: { gt: new Date() },
          },
          orderBy: { timestamp: 'desc' },
        });

        if (cachedPrice) {
          this.logger.log(`Using valid cached price -> $${cachedPrice.value}`);
          return cachedPrice.value;
        }

        const lastPrice = await this.prisma.price.findFirst({
          where: { asset: ASSETS.BITCOIN.ID },
          orderBy: { timestamp: 'desc' },
        });

        if (lastPrice) {
          this.logger.log(`Using expired cached price -> $${lastPrice.value}`);
          return lastPrice.value;
        }

        this.logger.error('No cached price data available');
      }

      throw new ServiceUnavailableException(
        `Failed to fetch latest Bitcoin price -> ${error.message}`,
      );
    }
  }
}
