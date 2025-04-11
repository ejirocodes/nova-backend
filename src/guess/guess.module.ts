import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { GuessSchema } from './schemas/guess.schema';
import { GuessModel } from './models/guess.model';
import { GuessController } from './controllers/guess.controller';
import { GuessService } from './services/guess.service';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [
    PriceModule,
    DynamooseModule.forFeature([
      {
        name: 'Guess',
        schema: GuessSchema,
        options: {
          tableName: 'guesses',
        },
      },
    ]),
  ],
  controllers: [GuessController],
  providers: [GuessService, GuessModel],
  exports: [GuessService, GuessModel],
})
export class GuessModule {}
