import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum GuessDirection {
  'up' = 'up',
  'down' = 'down',
}

export class CreateGuessDto {
  @ApiProperty({
    enum: GuessDirection,
    default: GuessDirection['up'],
    enumName: 'GuessDirection',
    required: true,
  })
  @IsNotEmpty({ message: 'Direction is required' })
  @IsString({ message: 'Direction must be a string' })
  @IsEnum(GuessDirection, {
    message: 'Direction must be one of: up, down',
  })
  direction: GuessDirection;
}

export class GuessResponseDto {
  @ApiProperty({
    type: String,
    description: 'The ID of the guess',
  })
  guessId: string;

  @ApiProperty({
    type: String,
    description: 'The direction of the guess',
  })
  direction: GuessDirection;

  @ApiProperty({
    type: Number,
    description: 'The start price of the guess',
  })
  startPrice: number;

  @ApiProperty({
    type: String,
    description: 'The created at date of the guess',
  })
  createdAt: string;
}

export class UserGuessStatsResponseDto {
  @ApiProperty({
    type: Number,
    description: 'The score of the user',
  })
  score: number;

  @ApiProperty({
    type: Number,
    description: 'The number of guesses made by the user',
  })
  guessesMade: number;

  @ApiProperty({
    type: Number,
    description: 'The number of guesses lost by the user',
  })
  guessesLost: number;

  @ApiProperty({
    type: Number,
    description: 'The number of guesses pending by the user',
  })
  guessesPending: number;

  @ApiProperty({
    type: Number,
    description: 'The active guess of the user',
  })
  activeGuess: number;

  @ApiProperty({
    type: Number,
    description: 'The ID of the user',
  })
  id: string;
}
