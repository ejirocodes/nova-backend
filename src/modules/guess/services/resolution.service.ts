import { Injectable, Logger } from '@nestjs/common';
import { GuessService } from './guess.service';
import { PrismaService } from '../../../config/db/prisma.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class ResolutionService {
  private readonly logger = new Logger(ResolutionService.name);

  constructor(
    private readonly guessService: GuessService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Check for guesses that need to be resolved every 10 seconds
   */
  @Interval(10000)
  async resolveGuesses() {
    try {
      const oneMinuteAgo = new Date(Date.now() - 60000);

      await this.prisma.$transaction(async (tx) => {
        const guessesToResolve = await tx.guess.findMany({
          where: {
            isActive: true,
            resolved: false,
            guessedAt: {
              lte: oneMinuteAgo,
            },
          },
          take: 20,
        });

        if (guessesToResolve.length === 0) {
          return;
        }

        this.logger.log(`Found ${guessesToResolve.length} guesses to resolve`);

        for (const guess of guessesToResolve) {
          const currentGuess = await tx.guess.findUnique({
            where: { id: guess.id },
            select: { resolved: true },
          });

          if (currentGuess && !currentGuess.resolved) {
            await this.guessService.resolveGuess(guess.id);
            this.logger.log(`Resolved guess -> ${guess.id}`);
          } else {
            this.logger.log(`Skipping already resolved guess -> ${guess.id}`);
          }
        }
      });
    } catch (error) {
      this.logger.error(
        `Failed to resolve guesses -> ${error.message}`,
        error.stack,
      );
    }
  }
}
