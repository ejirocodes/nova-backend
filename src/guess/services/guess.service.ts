import { Injectable } from '@nestjs/common';
import { Guess, GuessModel } from '../models/guess.model';
import { CreateGuessDto } from '../dtos/create-guess.dto';
import { generateUniqueId } from 'src/helpers/uuid.generator';
@Injectable()
export class GuessService {
  constructor(private readonly guessModel: GuessModel) {}

  async createGuess(guess: CreateGuessDto) {
    const payload: Guess = {
      guessId: generateUniqueId('act'),
      userId: generateUniqueId('user'),
      direction: guess.direction,
      startPrice: 0,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    return await this.guessModel.create(payload);
  }
}
