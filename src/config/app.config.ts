import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class AppConfig {
  @Value('PORT', {
    default: '3000',
    parse: parseInt,
  })
  port: number;

  @Value('HOST', {
    default: '0.0.0.0',
  })
  host: string;

  @Value('LOG_LEVEL', {
    default: 'info',
  })
  logLevel: string;

  @Value('LOG_FORMAT', {
    default: 'pretty',
  })
  logFormat: string;

  @Value('NODE_ENV', {
    default: 'development',
  })
  nodeEnv: string;

  @Value('AWS_REGION')
  awsRegion: string;

  @Value('AWS_ACCESS_KEY_ID')
  awsAccessKeyId: string;

  @Value('AWS_SECRET_ACCESS_KEY')
  awsSecretAccessKey: string;

  @Value('CRYPTOCURRENCY_API_URL')
  cryptocurrencyApiUrl: string;
}
