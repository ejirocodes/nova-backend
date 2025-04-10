import { Exclude } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @Exclude()
  user_id?: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNumber({}, { message: 'Score must be a number' })
  @IsOptional()
  score: number = 0;

  @IsNumber({}, { message: 'GuessesMade must be a number' })
  @IsOptional()
  guessesMade: number = 0;

  @IsNumber({}, { message: 'GuessesLost must be a number' })
  @IsOptional()
  guessesLost: number = 0;

  @IsNumber({}, { message: 'GuessesPending must be a number' })
  @IsOptional()
  guessesPending: number = 0;
}
