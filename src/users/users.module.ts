import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserSchema } from './schemas/user.schema';
import { UserModel } from './models/user.model';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        options: {
          tableName: 'Users',
        },
      },
    ]),
  ],
  providers: [UserModel, UsersService],
  exports: [UserModel],
  controllers: [UsersController],
})
export class UsersModule {}
