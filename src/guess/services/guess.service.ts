import { Injectable } from '@nestjs/common';
import { Guess, GuessModel } from '../models/guess.model';
import { CreateGuessDto } from '../dtos/create-guess.dto';
import { generateUniqueId } from 'src/helpers/uuid.generator';
import { PriceService } from 'src/price/services/price.service';
@Injectable()
export class GuessService {
  constructor(
    private readonly guessModel: GuessModel,
    private readonly priceService: PriceService,
  ) {}

  async createGuess(guess: CreateGuessDto) {
    const startPrice = await this.priceService.getLatestBitcoinPrice();
    const payload: Guess = {
      guessId: generateUniqueId('act'),
      userId: generateUniqueId('user'),
      direction: guess.direction,
      startPrice,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    return await this.guessModel.create(payload);
  }
}
