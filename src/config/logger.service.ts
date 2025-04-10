import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { LoggerConfig } from './logger.config';
import { AppConfig } from './app.config';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: Logger;

  constructor(private readonly appConfig: AppConfig) {
    this.logger = LoggerConfig.getInstance(appConfig).getLogger();
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }
}
