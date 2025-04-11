import { Schema } from 'dynamoose';

export const GuessSchema = new Schema(
  {
    guessId: {
      type: String,
      hashKey: true,
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: 'userId-index',
        type: 'global',
      },
    },
    direction: {
      type: String,
      enum: ['up', 'down'],
      required: true,
    },
    startPrice: {
      type: Number,
      required: true,
    },
    endPrice: {
      type: Number,
      required: false,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    result: {
      type: String,
      enum: ['correct', 'incorrect'],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
