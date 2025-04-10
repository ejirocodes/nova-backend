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
  direction: GuessDirection = GuessDirection['up'];
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
