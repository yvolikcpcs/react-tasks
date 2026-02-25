export type Difficulty = 'easy' | 'medium' | 'hard';

export type Task = {
  slug: string;
  title: string;
  difficulty?: Difficulty;
  tags?: string[];
};
