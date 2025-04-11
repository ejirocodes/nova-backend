import { Injectable } from '@nestjs/common';
import { CreateGuessDto } from '../dtos/create-guess.dto';
import { generateUniqueId } from 'src/helpers/uuid.generator';
import { PriceService } from 'src/price/services/price.service';
import { Guess } from '@prisma/client';
import { PrismaService } from '../../config/db/ prisma.service';

@Injectable()
export class GuessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceService: PriceService,
  ) {}

  async createGuess(guess: CreateGuessDto) {
    const startPrice = await this.priceService.getLatestBitcoinPrice();
    const payload: Guess = {
      userId: generateUniqueId('user'),
      direction: guess.direction,
      startPrice,
      resolved: false,
      endPrice: null,
      guessedAt: new Date(),
      isActive: true,
      result: null,
      id: generateUniqueId('user'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await this.prisma.guess.create({
      data: payload,
    });
  }
}
