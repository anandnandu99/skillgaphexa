export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type NormalizedDifficulty = 'easy' | 'medium' | 'hard';

export interface LLMQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: NormalizedDifficulty;
  category: string;
  topic: string;
}

export interface QuestionGenerationRequest {
  topic: string;
  difficulty: Difficulty;
  category: string;
  questionCount: number;
  userLevel?: string;
  previousTopics?: string[];
  userRole?: string;
  userDepartment?: string;
}

export interface FallbackQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type TopicQuestionBank = Record<Difficulty, FallbackQuestion[]>;
export type FallbackQuestionBank = Record<string, TopicQuestionBank>;
