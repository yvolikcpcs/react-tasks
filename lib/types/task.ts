export type Difficulty = 'easy' | 'medium' | 'hard';

export type Task = {
  slug: string;
  title: string;
  languageName?: string;
  difficulty?: Difficulty;
  tags?: string[];
};
