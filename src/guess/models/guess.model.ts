import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { GuessDirection, GuessResponseDto } from '../dtos/create-guess.dto';

export class Guess {
  guessId: string;
  userId: string;
  direction: GuessDirection;
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
    private readonly model: Model<Guess, GuessKey>,
  ) {}

  async create(guess: Guess): Promise<GuessResponseDto> {
    const result = await this.model.create(guess);

    return {
      guessId: result.guessId,
      direction: result.direction,
      startPrice: result.startPrice,
      createdAt: result.createdAt,
    };
  }

  async findOne(guessId: string): Promise<Guess | null> {
    return await this.model.get({ guessId });
  }

  async findByUserId(userId: string): Promise<Guess[]> {
    const result = await this.model
      .query('userId')
      .eq(userId)
      .using('userId-index')
      .exec();
    return result;
  }

  async findActiveByUserId(userId: string): Promise<Guess | null> {
    const result = await this.model
      .query('userId')
      .eq(userId)
      .using('userId-index')
      .where('resolved')
      .eq(false)
      .exec();
    return result.count > 0 ? result[0] : null;
  }

  async update(guessId: string, updateData: Partial<Guess>): Promise<Guess> {
    return await this.model.update({ guessId }, updateData);
  }

  async delete(guessId: string): Promise<void> {
    await this.model.delete({ guessId });
  }
}
