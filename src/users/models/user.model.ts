import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { User, UserKey } from '../interfaces/user.interface';

@Injectable()
export class UserModel {
  constructor(
    @InjectModel('User')
    private readonly model: Model<User, UserKey>,
  ) {}

  async create(user: User): Promise<User> {
    return await this.model.create(user);
  }

  async findOne(userId: string): Promise<User | null> {
    return await this.model.get({ user_id: userId });
  }

  async findAll(): Promise<User[]> {
    return await this.model.scan().exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.model.scan('email').eq(email).exec();
    return result.count > 0 ? result[0] : null;
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    return await this.model.update({ user_id: userId }, updateData);
  }

  async delete(userId: string): Promise<void> {
    await this.model.delete({ user_id: userId });
  }
}
