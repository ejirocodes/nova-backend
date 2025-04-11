import { Auth } from 'src/auth/decorators/auth.decorator';
import { UsersService } from '../services/users.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User, UserId } from 'src/auth/decorators/user.decorator';

@ApiTags('Users')
@Controller('users')
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @ApiOperation({ summary: 'Get user by clerk id' })
  @ApiResponse({ type: User })
  async getUserByClerkId(@UserId() clerkUserId: string) {
    return await this.usersService.getUserByClerkId(clerkUserId);
  }
}
