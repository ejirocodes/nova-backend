import { Injectable } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { PrismaService } from 'src/config/db/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userData: User) {
    return await this.prisma.user.create({
      data: userData,
    });
  }

  async getUserByClerkId(clerkId: string) {
    return await this.prisma.user.findUnique({
      where: { clerk_id: clerkId },
    });
  }
}
