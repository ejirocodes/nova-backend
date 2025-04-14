import { Test, TestingModule } from '@nestjs/testing';
import { GuessService } from '../guess.service';
import { PrismaService } from '../../../../config/db/prisma.service';
import { PriceService } from '../../../price/services/price.service';
import { BadRequestException } from '@nestjs/common';
import { CreateGuessDto, GuessDirection } from '../../dtos/create-guess.dto';
import { Guess, Result } from '@prisma/client';

describe('GuessService', () => {
  let service: GuessService;
  let prismaService: PrismaService;
  let priceService: PriceService;

  const pastDate = new Date();
  pastDate.setSeconds(pastDate.getSeconds() - 70);

  const recentDate = new Date();
  recentDate.setSeconds(recentDate.getSeconds() - 30);

  const NOW = 1618486800000;
  const PAST = NOW - 70000;
  const RECENT = NOW - 30000;

  const mockUser = {
    id: 'user_123',
    clerk_id: 'clerk_user_123',
    score: 5,
    guessesMade: 10,
    guessesLost: 5,
    guessesPending: 1,
    activeGuess: 'guess_123',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGuess: Guess = {
    id: 'guess_123',
    userId: 'user_123',
    direction: 'up' as any,
    startPrice: 50000,
    endPrice: null,
    guessedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    resolved: false,
    result: null,
  };

  const mockResolvedGuess: Guess = {
    ...mockGuess,
    endPrice: 51000,
    resolved: true,
    isActive: false,
    result: Result.correct,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue(mockUser),
    },
    guess: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([mockGuess]),
      create: jest.fn().mockResolvedValue(mockGuess),
      update: jest.fn().mockResolvedValue(mockResolvedGuess),
    },
  };

  const mockPriceService = {
    getLatestBitcoinPrice: jest.fn().mockResolvedValue(50000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuessService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PriceService,
          useValue: mockPriceService,
        },
      ],
    }).compile();

    service = module.get<GuessService>(GuessService);
    prismaService = module.get<PrismaService>(PrismaService);
    priceService = module.get<PriceService>(PriceService);

    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    mockPrismaService.guess.findUnique.mockResolvedValue(mockGuess);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(priceService).toBeDefined();
  });

  describe('createGuess', () => {
    it('should create a new guess when user has no active guesses', async () => {
      const createGuessDto: CreateGuessDto = { direction: GuessDirection.up };
      const clerkUserId = 'clerk_user_123';

      mockPrismaService.guess.findMany.mockResolvedValueOnce([]);

      const result = await service.createGuess(createGuessDto, clerkUserId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { clerk_id: clerkUserId },
      });
      expect(priceService.getLatestBitcoinPrice).toHaveBeenCalled();
      expect(prismaService.guess.create).toHaveBeenCalled();
      expect(result).toEqual(mockGuess);
    });

    it('should return existing active guess when user already has one', async () => {
      const createGuessDto: CreateGuessDto = { direction: GuessDirection.up };
      const clerkUserId = 'clerk_user_123';

      mockPrismaService.guess.findMany.mockResolvedValueOnce([mockGuess]);

      const result = await service.createGuess(createGuessDto, clerkUserId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { clerk_id: clerkUserId },
      });
      expect(prismaService.guess.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          isActive: true,
          resolved: false,
        },
      });
      expect(prismaService.guess.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockGuess);
    });

    it('should throw BadRequestException if user not found', async () => {
      const createGuessDto: CreateGuessDto = { direction: GuessDirection.up };
      const clerkUserId = 'nonexistent_user';

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.createGuess(createGuessDto, clerkUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resolveGuess', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    it('should resolve a guess correctly when time has passed and price went up', async () => {
      const guessId = 'guess_123';
      const upGuess = {
        ...mockGuess,
        direction: 'up' as any,
        guessedAt: pastDate,
      };

      const mockGuessedAt = { getTime: () => PAST };
      upGuess.guessedAt = mockGuessedAt as any;

      mockPrismaService.guess.findUnique.mockResolvedValueOnce(upGuess);
      mockPriceService.getLatestBitcoinPrice.mockResolvedValueOnce(55000);

      await service.resolveGuess(guessId);

      expect(prismaService.guess.findUnique).toHaveBeenCalledWith({
        where: { id: guessId },
      });
      expect(priceService.getLatestBitcoinPrice).toHaveBeenCalled();
      expect(prismaService.guess.update).toHaveBeenCalledWith({
        where: { id: guessId },
        data: {
          resolved: true,
          isActive: false,
          endPrice: 55000,
          result: Result.correct,
        },
      });
    });

    it('should resolve a guess as incorrect when price went opposite to prediction', async () => {
      const guessId = 'guess_123';
      const downGuess = {
        ...mockGuess,
        direction: 'down' as any,
        guessedAt: pastDate,
      };

      const mockGuessedAt = { getTime: () => PAST };
      downGuess.guessedAt = mockGuessedAt as any;

      mockPrismaService.guess.findUnique.mockResolvedValueOnce(downGuess);
      mockPriceService.getLatestBitcoinPrice.mockResolvedValueOnce(55000);

      const incorrectGuess = {
        ...mockResolvedGuess,
        result: Result.incorrect,
      };
      mockPrismaService.guess.update.mockResolvedValueOnce(incorrectGuess);

      await service.resolveGuess(guessId);

      expect(prismaService.guess.update).toHaveBeenCalledWith({
        where: { id: guessId },
        data: {
          resolved: true,
          isActive: false,
          endPrice: 55000,
          result: Result.incorrect,
        },
      });
    });

    it('should not resolve a guess if less than 60 seconds have passed', async () => {
      const guessId = 'guess_123';

      const recentGuess = {
        ...mockGuess,
        guessedAt: recentDate,
      };

      recentGuess.guessedAt = new Date(RECENT);

      mockPrismaService.guess.findUnique.mockResolvedValueOnce(recentGuess);

      const result = await service.resolveGuess(guessId);

      expect(prismaService.guess.findUnique).toHaveBeenCalledWith({
        where: { id: guessId },
      });
      expect(prismaService.guess.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should not resolve an already resolved guess', async () => {
      const guessId = 'guess_123';
      const resolvedGuess = {
        ...mockGuess,
        resolved: true,
        guessedAt: pastDate,
      };

      mockPrismaService.guess.findUnique.mockResolvedValueOnce(resolvedGuess);

      const result = await service.resolveGuess(guessId);

      expect(prismaService.guess.findUnique).toHaveBeenCalledWith({
        where: { id: guessId },
      });
      expect(prismaService.guess.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('guessStatus', () => {
    it('should return guess status by id', async () => {
      const guessId = 'guess_123';
      const specificGuess = { ...mockGuess };

      mockPrismaService.guess.findUnique.mockResolvedValueOnce(specificGuess);

      const result = await service.guessStatus(guessId);

      expect(prismaService.guess.findUnique).toHaveBeenCalledWith({
        where: { id: guessId },
      });
      expect(result).toEqual(specificGuess);
    });
  });

  describe('getUserActiveGuess', () => {
    it('should return active guesses for a user', async () => {
      const userId = 'user_123';

      const result = await service.getUserActiveGuess(userId);

      expect(prismaService.guess.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isActive: true,
          resolved: false,
        },
      });
      expect(result).toEqual([mockGuess]);
    });
  });

  describe('getUserGuessStats', () => {
    it('should return user guess statistics', async () => {
      const clerkUserId = 'clerk_user_123';

      const mockUserWithSelectedFields = {
        id: mockUser.id,
        score: mockUser.score,
        guessesMade: mockUser.guessesMade,
        guessesLost: mockUser.guessesLost,
        guessesPending: mockUser.guessesPending,
      };

      mockPrismaService.user.findUnique.mockImplementation((params) => {
        if (params?.select) {
          return Promise.resolve(mockUserWithSelectedFields);
        }
        return Promise.resolve(mockUser);
      });

      mockPrismaService.guess.findMany.mockResolvedValueOnce([mockGuess]);

      const result = await service.getUserGuessStats(clerkUserId);

      expect(result).toEqual({
        ...mockUserWithSelectedFields,
        activeGuess: 1,
      });
    });
  });

  describe('getUserByClerkId', () => {
    it('should return a user by clerk id', async () => {
      const clerkUserId = 'clerk_user_123';

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.getUserByClerkId(clerkUserId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { clerk_id: clerkUserId },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
