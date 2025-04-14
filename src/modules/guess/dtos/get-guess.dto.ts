import { $Enums, Guess } from '@prisma/client';

export class GuessDto implements Guess {
  result: $Enums.Result;
  id: string;
  userId: string;
  direction: $Enums.Direction;
  startPrice: number;
  endPrice: number;
  guessedAt: Date;
  isActive: boolean;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
