import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { User } from '../interfaces/user.interface';

jest.mock('src/auth/decorators/auth.decorator', () => ({
  Auth: jest.fn().mockImplementation(() => {
    return jest.fn();
  }),
}));

jest.mock('src/auth/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => {
    return jest.fn();
  }),
  UserId: jest.fn().mockImplementation(() => {
    return jest.fn();
  }),
}));

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser: User = {
    user_id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
    score: 0,
    guessesMade: 0,
    guessesLost: 0,
    guessesPending: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    getUserByClerkId: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(
        jest.requireMock('src/auth/decorators/auth.decorator').Auth,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('getUserByClerkId', () => {
    it('should get a user by clerk id', async () => {
      const clerkUserId = 'clerk_user_123';

      const result = await controller.getUserByClerkId(clerkUserId);

      expect(usersService.getUserByClerkId).toHaveBeenCalledWith(clerkUserId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const clerkUserId = 'nonexistent_clerk_id';

      mockUsersService.getUserByClerkId.mockResolvedValueOnce(null);

      const result = await controller.getUserByClerkId(clerkUserId);

      expect(usersService.getUserByClerkId).toHaveBeenCalledWith(clerkUserId);
      expect(result).toBeNull();
    });
  });
});
