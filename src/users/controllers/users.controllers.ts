import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../interfaces/user.interface';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('users')
export class UsersControllers {
  constructor(private readonly usersSevice: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersSevice.createUser(createUserDto);
  }

  @Get()
  async getUsers(): Promise<User[]> {
    return this.usersSevice.getUsers();
  }
}
