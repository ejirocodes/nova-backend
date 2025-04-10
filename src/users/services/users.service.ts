import { Injectable, ConflictException } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import { generateUniqueId } from 'src/helpers/uuid.generator';
import { User } from '../interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly userModel: UserModel) {}

  async createUser(userData: Omit<User, 'user_id'>): Promise<User> {
    const existingUser = await this.userModel.findByEmail(userData.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user: User = {
      user_id: generateUniqueId('user'),
      ...userData,
    };

    return this.userModel.create(user);
  }

  async getUsers(): Promise<User[]> {
    return this.userModel.findAll();
  }
}
