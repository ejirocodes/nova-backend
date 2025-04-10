import { Schema } from 'dynamoose';

export const UserSchema = new Schema(
  {
    user_id: {
      type: String,
      hashKey: true,
      required: true,
    },
    clerk_id: {
      type: String,
      index: {
        name: 'clerk_id-index',
        type: 'global',
      },
    },
    email: {
      type: String,
      required: true,
      index: {
        name: 'email-index',
        type: 'global',
      },
    },
    name: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    guessesMade: {
      type: Number,
      default: 0,
    },
    guessesLost: {
      type: Number,
      default: 0,
    },
    guessesPending: {
      type: Number,
      default: 0,
    },
    activeGuess: {
      type: Object,
      schema: {
        guessId: String,
        direction: {
          type: String,
          enum: ['up', 'down'],
        },
        startPrice: Number,
        resolved: Boolean,
      },
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
