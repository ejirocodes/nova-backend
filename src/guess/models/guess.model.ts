import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';

export interface IGuess {
  guessId: string;
  userId: string;
  direction: 'up' | 'down';
  startPrice: number;
  endPrice?: number;
  createdAt: string;
  resolved: boolean;
  result?: 'correct' | 'incorrect';
}

export interface GuessKey {
  guessId: string;
}

@Injectable()
export class GuessModel {
  constructor(
    @InjectModel('Guess')
    private readonly model: Model<IGuess, GuessKey>,
  ) {}

  async create(guess: IGuess): Promise<IGuess> {
    return await this.model.create(guess);
  }

  async findOne(guessId: string): Promise<IGuess | null> {
    return await this.model.get({ guessId });
  }

  async findByUserId(userId: string): Promise<IGuess[]> {
    const result = await this.model.scan('userId').eq(userId).exec();
    return result;
  }

  async findActiveByUserId(userId: string): Promise<IGuess | null> {
    const result = await this.model
      .scan('userId')
      .eq(userId)
      .where('resolved')
      .eq(false)
      .exec();
    return result.count > 0 ? result[0] : null;
  }

  async update(guessId: string, updateData: Partial<IGuess>): Promise<IGuess> {
    return await this.model.update({ guessId }, updateData);
  }

  async delete(guessId: string): Promise<void> {
    await this.model.delete({ guessId });
  }
}
