import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigifyModule } from '@itgorillaz/configify';
import { LoggerModule } from './config/logger.module';

@Module({
  imports: [ConfigifyModule.forRootAsync(), LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
