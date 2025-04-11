import {
  Injectable,
  OnModuleInit,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error(
        `Failed to connect to the database -> ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from the database');
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Database connection is healthy');
      return true;
    } catch (error) {
      this.logger.error(
        `Database connection check failed -> ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
