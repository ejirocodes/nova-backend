import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGuessDto } from '../dtos/create-guess.dto';
import { generateUniqueId } from 'src/helpers/uuid.generator';
import { PriceService } from 'src/price/services/price.service';
import { PrismaService } from 'src/config/db/prisma.service';
import { Guess, Result } from '@prisma/client';

@Injectable()
export class GuessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceService: PriceService,
  ) {}

  async createGuess(guess: CreateGuessDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const activeGuess = await this.prisma.guess.findFirst({
      where: {
        userId,
        isActive: true,
        resolved: false,
      },
    });

    if (activeGuess) {
      throw new BadRequestException('User already has an active guess');
    }

    const startPrice = await this.priceService.getLatestBitcoinPrice();
    const payload: Guess = {
      userId: user.id,
      direction: guess.direction,
      startPrice,
      resolved: false,
      endPrice: null,
      guessedAt: new Date(),
      isActive: true,
      result: null,
      id: generateUniqueId('guess'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await this.prisma.guess.create({
      data: payload,
    });
  }

  async resolveGuess(guessId: string) {
    const guess = await this.prisma.guess.findUnique({
      where: { id: guessId },
    });

    if (!guess || guess.resolved) {
      return null;
    }

    const now = new Date();
    const guessTime = new Date(guess.guessedAt);
    const timeDifference = now.getTime() - guessTime.getTime();

    if (timeDifference < 60000) {
      return null;
    }

    const currentPrice = await this.priceService.getLatestBitcoinPrice();

    let result: Result;
    if (
      (guess.direction === 'up' && currentPrice > guess.startPrice) ||
      (guess.direction === 'down' && currentPrice < guess.startPrice)
    ) {
      result = Result.correct;
    } else {
      result = Result.incorrect;
    }

    const updatedGuess = await this.prisma.guess.update({
      where: { id: guessId },
      data: {
        resolved: true,
        isActive: false,
        endPrice: currentPrice,
        result,
      },
    });

    await this.updateUserScore(guess.userId, result);

    return updatedGuess;
  }

  private async updateUserScore(userId: string, result: Result) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { guessesPending: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        score: {
          increment: result === Result.correct ? 1 : -1,
        },
        guessesMade: { increment: 1 },
        guessesLost: result === Result.incorrect ? { increment: 1 } : undefined,
        guessesPending:
          user?.guessesPending && user.guessesPending > 0
            ? { decrement: 1 }
            : undefined,
        activeGuess: null,
      },
    });
  }

  async getUserActiveGuess(userId: string) {
    return await this.prisma.guess.findFirst({
      where: {
        userId,
        isActive: true,
        resolved: false,
      },
    });
  }

  async getUserGuessStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        score: true,
        guessesMade: true,
        guessesLost: true,
        guessesPending: true,
      },
    });

    const activeGuess = await this.getUserActiveGuess(userId);

    return {
      ...user,
      activeGuess,
    };
  }
}
