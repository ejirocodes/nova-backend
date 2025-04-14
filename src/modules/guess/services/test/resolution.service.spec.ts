import { Test, TestingModule } from '@nestjs/testing';
import { ResolutionService } from '../resolution.service';
import { GuessService } from '../guess.service';
import { PrismaService } from '../../../../config/db/prisma.service';
import { Logger } from '@nestjs/common';

describe('ResolutionService', () => {
  let service: ResolutionService;
  let guessService: GuessService;
  let prismaService: PrismaService;

  const mockGuess = {
    id: 'guess_123',
    userId: 'user_123',
    direction: 'up',
    startPrice: 50000,
    endPrice: null,
    guessedAt: new Date(Date.now() - 120000),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    resolved: false,
    result: null,
  };

  const mockGuessService = {
    resolveGuess: jest.fn().mockResolvedValue({
      ...mockGuess,
      resolved: true,
      isActive: false,
      endPrice: 51000,
      result: 'correct',
    }),
  };

  const txMock = {
    guess: {
      findMany: jest.fn().mockResolvedValue([mockGuess]),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockGuess.id) {
          return Promise.resolve({ resolved: false });
        }
        return Promise.resolve(null);
      }),
    },
  };

  const mockPrismaService = {
    guess: {
      findMany: jest.fn().mockResolvedValue([mockGuess]),
    },
    $transaction: jest.fn().mockImplementation((callback) => callback(txMock)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolutionService,
        {
          provide: GuessService,
          useValue: mockGuessService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ResolutionService>(ResolutionService);
    guessService = module.get<GuessService>(GuessService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(guessService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('resolveGuesses', () => {
    it('should resolve pending guesses older than 1 minute', async () => {
      await service.resolveGuesses();

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(txMock.guess.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          resolved: false,
          guessedAt: {
            lte: expect.any(Date),
          },
        },
        take: 20,
      });

      expect(guessService.resolveGuess).toHaveBeenCalledWith(mockGuess.id);
      expect(guessService.resolveGuess).toHaveBeenCalledTimes(1);
    });

    it('should handle empty list of guesses to resolve', async () => {
      txMock.guess.findMany.mockResolvedValueOnce([]);

      await service.resolveGuesses();

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(txMock.guess.findMany).toHaveBeenCalled();
      expect(guessService.resolveGuess).not.toHaveBeenCalled();
    });

    it('should handle multiple guesses to resolve', async () => {
      const mockGuesses = [
        { ...mockGuess, id: 'guess_123' },
        { ...mockGuess, id: 'guess_456' },
        { ...mockGuess, id: 'guess_789' },
      ];

      txMock.guess.findUnique.mockImplementation(({ where }) => {
        if (['guess_123', 'guess_456', 'guess_789'].includes(where.id)) {
          return Promise.resolve({ resolved: false });
        }
        return Promise.resolve(null);
      });

      txMock.guess.findMany.mockResolvedValueOnce(mockGuesses);

      await service.resolveGuesses();

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(txMock.guess.findMany).toHaveBeenCalled();
      expect(guessService.resolveGuess).toHaveBeenCalledTimes(3);
      expect(guessService.resolveGuess).toHaveBeenCalledWith('guess_123');
      expect(guessService.resolveGuess).toHaveBeenCalledWith('guess_456');
      expect(guessService.resolveGuess).toHaveBeenCalledWith('guess_789');
    });

    it('should handle errors during resolution', async () => {
      const error = new Error('Resolution failed');
      prismaService.$transaction = jest.fn().mockRejectedValue(error);

      await service.resolveGuesses();

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(guessService.resolveGuess).not.toHaveBeenCalled();
    });
  });
});
