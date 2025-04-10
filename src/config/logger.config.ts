import { format, transports, createLogger } from 'winston';
import { AppConfig } from './app.config';

export class LoggerConfig {
  private static instance: LoggerConfig;
  private readonly appConfig: AppConfig;
  private readonly logger;

  private constructor(appConfig: AppConfig) {
    this.appConfig = appConfig;
    this.logger = this.createLogger();
  }

  public static getInstance(appConfig: AppConfig) {
    if (!LoggerConfig.instance) {
      LoggerConfig.instance = new LoggerConfig(appConfig);
    }
    return LoggerConfig.instance;
  }

  private createLogger() {
    const { logLevel, logFormat, nodeEnv } = this.appConfig;

    const baseFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      logFormat === 'json'
        ? format.json()
        : format.printf(
          ({ timestamp, level, message, context, trace, stack }) => {
            return `${timestamp} [${level}] [${context || 'Application'}] ${message} ${stack || trace || ''}`;
          },
        ),
    );

    const consoleFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.colorize({ all: true }),
      format.printf(({ timestamp, level, message, context, trace, stack }) => {
        return `${timestamp} [${level}] [${context || 'Application'}] ${message} ${stack || trace || ''}`;
      }),
    );

    return createLogger({
      level: logLevel,
      defaultMeta: { service: 'nova-backend' },
      transports: [
        new transports.Console({
          format: consoleFormat,
        }),
        // Add file transport in production
        ...(nodeEnv === 'production'
          ? [
            new transports.File({
              filename: 'logs/error.log',
              level: 'error',
              maxsize: 10485760, // 10MB
              maxFiles: 5,
              format: baseFormat,
            }),
            new transports.File({
              filename: 'logs/combined.log',
              maxsize: 10485760, // 10MB
              maxFiles: 5,
              format: baseFormat,
            }),
          ]
          : []),
      ],
      exitOnError: false,
    });
  }

  getLogger() {
    return this.logger;
  }
}
