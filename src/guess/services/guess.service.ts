import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateGuessDto,
  GuessResponseDto,
  UserGuessStatsResponseDto,
} from '../dtos/create-guess.dto';
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

  async createGuess(
    guess: CreateGuessDto,
    userId: string,
  ): Promise<GuessResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const activeGuess = await this.prisma.guess.findMany({
      where: {
        userId: user.id,
        isActive: true,
        resolved: false,
      },
    });

    if (activeGuess.length > 0) {
      return activeGuess[0] as unknown as GuessResponseDto;
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

    return (await this.prisma.guess.create({
      data: payload,
    })) as unknown as GuessResponseDto;
  }

  async resolveGuess(guessId: string) {
    const guess = await this.prisma.guess.findUnique({
      where: { id: guessId },
    });

    if (!guess || guess.resolved) {
      return null;
    }

    const now = Date.now();
    const guessTime =
      guess.guessedAt instanceof Date
        ? guess.guessedAt.getTime()
        : new Date(guess.guessedAt).getTime();
    const timeDifference = now - guessTime;

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

  async guessStatus(guessId: string): Promise<GuessResponseDto> {
    const guess = await this.prisma.guess.findUnique({
      where: { id: guessId },
    });

    return guess as unknown as GuessResponseDto;
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

  async getUserActiveGuess(userId: string): Promise<Guess[]> {
    const activeGuess = await this.prisma.guess.findMany({
      where: {
        userId,
        isActive: true,
        resolved: false,
      },
    });

    return activeGuess;
  }

  async getUserGuessStats(userId: string): Promise<UserGuessStatsResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { clerk_id: userId },
      select: {
        score: true,
        guessesMade: true,
        guessesLost: true,
        guessesPending: true,
        id: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const activeGuess = await this.getUserActiveGuess(user.id);

    return {
      ...user,
      activeGuess: activeGuess.length,
    };
  }

  async getUserByClerkId(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerk_id: clerkUserId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
