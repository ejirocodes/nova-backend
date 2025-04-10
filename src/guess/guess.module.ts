import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { GuessSchema } from './schemas/guess.schema';
import { GuessModel } from './models/guess.model';

@Module({
  imports: [
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
  providers: [GuessModel],
  exports: [GuessModel],
})
export class GuessModule {}
