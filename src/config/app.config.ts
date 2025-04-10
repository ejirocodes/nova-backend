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
}
