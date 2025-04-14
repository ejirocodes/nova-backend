import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/config/db/prisma.service';
import { User } from '../interfaces/user.interface';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

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

  const mockPrismaService = {
    user: {
      create: jest.fn().mockResolvedValue(mockUser),
      findUnique: jest.fn().mockResolvedValue(mockUser),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const result = await service.createUser(mockUser);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: mockUser,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserByClerkId', () => {
    it('should retrieve a user by clerk id', async () => {
      const clerkId = 'clerk_123';

      const result = await service.getUserByClerkId(clerkId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { clerk_id: clerkId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const clerkId = 'nonexistent_clerk_id';

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.getUserByClerkId(clerkId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { clerk_id: clerkId },
      });
      expect(result).toBeNull();
    });
  });
});
