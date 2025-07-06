import type {
  LLMQuestion,
  QuestionGenerationRequest,
  Difficulty,
  FallbackQuestion,
  TopicQuestionBank,
  FallbackQuestionBank,
  NormalizedDifficulty
} from './types';

class LLMService {
  private readonly API_ENDPOINT = '/api/azureai';
  private readonly MODEL = 'gpt-4';
  private readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  async generateQuestions(request: QuestionGenerationRequest): Promise<LLMQuestion[]> {
    try {
      if (!this.API_KEY) {
        console.warn('API key not found. Using fallback questions.');
        return this.generateFallbackQuestions(request);
      }

      const prompt = this.createPrompt(request);
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert assessment creator. Generate high-quality multiple-choice questions with detailed explanations. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('No content from OpenAI');

      return this.parseOpenAIResponse(content, request);
    } catch (error) {
      console.error('LLM Error:', error);
      return this.generateFallbackQuestions(request);
    }
  }

  private createPrompt(request: QuestionGenerationRequest): string {
    const context = request.userRole && request.userDepartment
      ? `The user is a ${request.userRole} working in ${request.userDepartment}.`
      : '';

    return `
Generate ${request.questionCount} multiple-choice questions for a ${request.difficulty} level assessment on "${request.topic}" in the ${request.category} category.
${context}

Requirements:
- 4 options per question
- Real-world scenario based
- Include explanations
- Respond with valid JSON array in this format:

[
  {
    "question": "Your question?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why the answer is correct",
    "difficulty": "${this.mapDifficultyLevel(request.difficulty)}",
    "category": "${request.category}",
    "topic": "${request.topic}"
  }
]
    `;
  }

  private parseOpenAIResponse(content: string, request: QuestionGenerationRequest): LLMQuestion[] {
    try {
      const cleaned = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) throw new Error('Invalid format');

      return parsed.map((q, i) => ({
        id: i + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty ?? this.mapDifficultyLevel(request.difficulty),
        category: q.category ?? request.category,
        topic: q.topic ?? request.topic
      }));
    } catch (err) {
      console.error('Failed to parse response:', err);
      throw new Error('Invalid response format from OpenAI');
    }
  }

  private generateFallbackQuestions(request: QuestionGenerationRequest): LLMQuestion[] {
    const bank = this.getFallbackQuestionBank();
    const topicKey = bank[request.topic] ? request.topic : 'JavaScript Fundamentals Assessment';
    const topic = bank[topicKey];
    const questions = topic[request.difficulty] ?? topic.beginner;

    const selected = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, request.questionCount);

    return selected.map((q, i) => ({
      id: i + 1,
      question: this.personalizeQuestion(q.question, request),
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: this.mapDifficultyLevel(request.difficulty),
      category: request.category,
      topic: request.topic
    }));
  }

  private personalizeQuestion(question: string, request: QuestionGenerationRequest): string {
    if (request.userRole && request.userDepartment && Math.random() > 0.7) {
      const prefix = `As a ${request.userRole} in ${request.userDepartment}, `;
      return prefix + question.toLowerCase();
    }
    return question;
  }

  private mapDifficultyLevel(level: Difficulty): NormalizedDifficulty {
    const map: Record<Difficulty, NormalizedDifficulty> = {
      beginner: 'easy',
      intermediate: 'medium',
      advanced: 'hard'
    };

    return map[level];
  }

  async generateAssessmentQuestions(title: string, userContext: any): Promise<LLMQuestion[]> {
    const config = this.getAssessmentConfig(title);
    const request: QuestionGenerationRequest = {
      topic: config.topic,
      difficulty: config.difficulty,
      category: config.category,
      questionCount: 5,
      userLevel: userContext.level,
      userRole: userContext.role,
      userDepartment: userContext.department
    };
    return this.generateQuestions(request);
  }

  private getAssessmentConfig(title: string) {
    const map: Record<string, { topic: string; difficulty: Difficulty; category: string }> = {
      'JavaScript Fundamentals Assessment': { topic: 'JavaScript Programming', difficulty: 'beginner', category: 'programming' },
      'React Advanced Patterns': { topic: 'React.js Framework', difficulty: 'advanced', category: 'programming' },
      'Data Science Fundamentals': { topic: 'Data Science', difficulty: 'intermediate', category: 'data-science' },
      'AWS Cloud Practitioner': { topic: 'AWS Cloud', difficulty: 'beginner', category: 'cloud' },
      'Cybersecurity Risk Assessment': { topic: 'Cybersecurity', difficulty: 'advanced', category: 'security' },
      'UI/UX Design Principles': { topic: 'UI/UX Design', difficulty: 'intermediate', category: 'design' }
    };
    return map[title] || { topic: 'Technology', difficulty: 'intermediate', category: 'general' };
  }

  private getFallbackQuestionBank(): FallbackQuestionBank {
    return {
      'JavaScript Fundamentals Assessment': {
        beginner: [
          {
            question: 'Which keyword declares a block-scoped variable?',
            options: ['var', 'let', 'const', 'define'],
            correctAnswer: 1,
            explanation: '`let` is block scoped. `var` is function scoped.'
          },
          {
            question: 'What is the output of typeof null?',
            options: ['"null"', '"undefined"', '"object"', '"boolean"'],
            correctAnswer: 2,
            explanation: '`typeof null` returns "object", a known JavaScript quirk.'
          }
        ],
        intermediate: [],
        advanced: []
      },
      'React Advanced Patterns': {
        beginner: [
          {
            question: 'What is JSX?',
            options: ['A JavaScript extension for XML-like syntax', 'A JSON parser', 'A state manager', 'A type checker'],
            correctAnswer: 0,
            explanation: 'JSX allows HTML-like syntax in JavaScript files.'
          }
        ],
        intermediate: [],
        advanced: []
      }
    };
  }
}

export const llmService = new LLMService();