export interface User {
  user_id: string;
  email: string;
  name: string;
  score: number;
  guessesMade: number;
  guessesLost: number;
  guessesPending: number;
  activeGuess?: {
    guessId: string;
    direction: 'up' | 'down';
    startPrice: number;
    createdAt: string;
    resolved: boolean;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserKey {
  user_id: string;
}
