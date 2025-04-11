import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { PrismaService } from '../config/db/prisma.service';

@Module({
  imports: [],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
  controllers: [],
})
export class UsersModule {}
