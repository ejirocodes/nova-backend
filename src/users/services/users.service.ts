import { Injectable } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { PrismaService } from '../../config/db/ prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userData: User) {
    return await this.prisma.user.create({
      data: userData,
    });
  }
}
