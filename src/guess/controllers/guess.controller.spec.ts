import { Test, TestingModule } from '@nestjs/testing';
import { GuessController } from './guess.controller';
import { GuessService } from '../services/guess.service';
import { ResolutionService } from '../services/resolution.service';
import {
  CreateGuessDto,
  GuessDirection,
  GuessResponseDto,
  UserGuessStatsResponseDto,
} from '../dtos/create-guess.dto';
import { GuessDto } from '../dtos/get-guess.dto';

jest.mock('../../auth/decorators/auth.decorator', () => ({
  Auth: jest.fn().mockImplementation(() => {
    return jest.fn();
  }),
}));

jest.mock('../../auth/decorators/user.decorator', () => ({
  UserId: jest.fn().mockImplementation(() => {
    return jest.fn();
  }),
}));

describe('GuessController', () => {
  let controller: GuessController;
  let guessService: GuessService;
  let resolutionService: ResolutionService;

  const mockGuessResponse: GuessResponseDto = {
    id: 'guess_123',
    userId: 'user_123',
    direction: GuessDirection.up,
    startPrice: 50000,
    endPrice: 51000,
    guessedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    resolved: false,
    result: null,
  };

  const mockGuessArray: GuessDto[] = [
    {
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
    },
  ];

  const mockUserStats: UserGuessStatsResponseDto = {
    id: 'user_123',
    score: 5,
    guessesMade: 10,
    guessesLost: 5,
    guessesPending: 0,
    activeGuess: 0,
  };

  const mockGuessService = {
    createGuess: jest.fn().mockResolvedValue(mockGuessResponse),
    guessStatus: jest.fn().mockResolvedValue(mockGuessResponse),
    resolveGuess: jest.fn().mockResolvedValue(mockGuessResponse),
    getUserActiveGuess: jest.fn().mockResolvedValue(mockGuessArray),
    getUserGuessStats: jest.fn().mockResolvedValue(mockUserStats),
    getUserByClerkId: jest.fn().mockResolvedValue({ id: 'user_123' }),
  };

  const mockResolutionService = {
    resolveGuesses: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuessController],
      providers: [
        {
          provide: GuessService,
          useValue: mockGuessService,
        },
        {
          provide: ResolutionService,
          useValue: mockResolutionService,
        },
      ],
    })
      .overrideGuard(
        jest.requireMock('../../auth/decorators/auth.decorator').Auth,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GuessController>(GuessController);
    guessService = module.get<GuessService>(GuessService);
    resolutionService = module.get<ResolutionService>(ResolutionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(guessService).toBeDefined();
    expect(resolutionService).toBeDefined();
  });

  describe('createGuess', () => {
    it('should create a guess successfully', async () => {
      const createGuessDto: CreateGuessDto = { direction: GuessDirection.up };
      const clerkUserId = 'clerk_user_123';

      const result = await controller.createGuess(createGuessDto, clerkUserId);

      expect(guessService.createGuess).toHaveBeenCalledWith(
        createGuessDto,
        clerkUserId,
      );
      expect(result).toEqual(mockGuessResponse);
    });
  });

  describe('getGuessStatus', () => {
    it('should get guess status by id', async () => {
      const guessId = 'guess_123';

      const result = await controller.getGuessStatus(guessId);

      expect(guessService.guessStatus).toHaveBeenCalledWith(guessId);
      expect(result).toEqual(mockGuessResponse);
    });
  });

  describe('resolveGuess', () => {
    it('should resolve a guess by id', async () => {
      const guessId = 'guess_123';

      const result = await controller.resolveGuess(guessId);

      expect(guessService.resolveGuess).toHaveBeenCalledWith(guessId);
      expect(result).toEqual(mockGuessResponse);
    });
  });

  describe('getUserActiveGuess', () => {
    it('should get active guesses for user', async () => {
      const clerkUserId = 'clerk_user_123';

      const result = await controller.getUserActiveGuess(clerkUserId);

      expect(guessService.getUserByClerkId).toHaveBeenCalledWith(clerkUserId);
      expect(guessService.getUserActiveGuess).toHaveBeenCalledWith('user_123');
      expect(result).toEqual(mockGuessArray);
    });
  });

  describe('getUserGuessStats', () => {
    it('should get user guess statistics', async () => {
      const clerkUserId = 'clerk_user_123';

      const result = await controller.getUserGuessStats(clerkUserId);

      expect(guessService.getUserGuessStats).toHaveBeenCalledWith(clerkUserId);
      expect(result).toEqual(mockUserStats);
    });
  });

  describe('resolveAllGuesses', () => {
    it('should trigger resolution of all pending guesses', async () => {
      const result = await controller.resolveAllGuesses();

      expect(resolutionService.resolveGuesses).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Resolution process triggered',
      });
    });
  });
});
