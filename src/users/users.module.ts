import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { PrismaService } from '../config/db/prisma.service';
import { UsersController } from './controllers/users.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, ConfigModule],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
