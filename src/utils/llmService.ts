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
  private readonly API_ENDPOINT = 'https://hexavarsity-secureapi.azurewebsites.net/api/azureai';
  private readonly MODEL = 'gpt-4';

  async generateQuestions(request: QuestionGenerationRequest): Promise<LLMQuestion[]> {
    try {
      console.log('Attempting to generate questions with Azure OpenAI...', request);
      
      const prompt = this.createPrompt(request);
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('No content from Azure OpenAI');
      }

      return this.parseOpenAIResponse(content, request);
    } catch (error) {
      console.error('LLM Error:', error);
      
      // Only use fallback if API is completely unavailable
      console.warn('API failed, using fallback questions as last resort');
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
- 4 options per question (A, B, C, D)
- Real-world scenario based questions
- Include detailed explanations for correct answers
- Questions should be relevant to ${request.userRole || 'professionals'} in ${request.userDepartment || 'technology'}
- Difficulty level: ${request.difficulty}
- Respond with valid JSON array in this exact format:

[
  {
    "question": "Your question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "${this.mapDifficultyLevel(request.difficulty)}",
    "category": "${request.category}",
    "topic": "${request.topic}"
  }
]

Make sure the response is valid JSON and contains exactly ${request.questionCount} questions.
    `;
  }

  private parseOpenAIResponse(content: string, request: QuestionGenerationRequest): LLMQuestion[] {
    try {
      console.log('Parsing OpenAI response:', content);
      
      // Clean the response - remove markdown code blocks if present
      let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // Try to find JSON array in the response
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      if (parsed.length === 0) {
        throw new Error('No questions in response');
      }

      return parsed.map((q, i) => {
        // Validate question structure
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
          throw new Error(`Invalid question structure at index ${i}`);
        }

        return {
          id: i + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'No explanation provided',
          difficulty: q.difficulty ?? this.mapDifficultyLevel(request.difficulty),
          category: q.category ?? request.category,
          topic: q.topic ?? request.topic
        };
      });
    } catch (err) {
      console.error('Failed to parse OpenAI response:', err);
      console.error('Raw content:', content);
      throw new Error(`Invalid response format from Azure OpenAI: ${err.message}`);
    }
  }

  private generateFallbackQuestions(request: QuestionGenerationRequest): LLMQuestion[] {
    console.log('Generating fallback questions for:', request);
    
    const bank = this.getFallbackQuestionBank();
    const topicKey = this.findBestMatchingTopic(request.topic, bank);
    const topic = bank[topicKey];
    const questions = topic[request.difficulty] ?? topic.beginner;

    if (questions.length === 0) {
      // If no questions for this difficulty, try other difficulties
      const allQuestions = [...topic.beginner, ...topic.intermediate, ...topic.advanced];
      if (allQuestions.length === 0) {
        // Use default questions if nothing found
        return this.getDefaultQuestions(request);
      }
      questions.push(...allQuestions);
    }

    const selected = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(request.questionCount, questions.length));

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

  private findBestMatchingTopic(requestedTopic: string, bank: FallbackQuestionBank): string {
    // Direct match
    if (bank[requestedTopic]) return requestedTopic;
    
    // Partial match
    const keys = Object.keys(bank);
    const match = keys.find(key => 
      key.toLowerCase().includes(requestedTopic.toLowerCase()) ||
      requestedTopic.toLowerCase().includes(key.toLowerCase())
    );
    
    return match || keys[0]; // Return first available if no match
  }

  private getDefaultQuestions(request: QuestionGenerationRequest): LLMQuestion[] {
    const defaultQuestions = [
      {
        question: `What is a key principle in ${request.category}?`,
        options: ['Best practices', 'Random approach', 'Ignoring standards', 'Avoiding documentation'],
        correctAnswer: 0,
        explanation: 'Following best practices is essential in any technical field.'
      },
      {
        question: `Which skill is most important for a ${request.userRole || 'professional'}?`,
        options: ['Continuous learning', 'Avoiding challenges', 'Working in isolation', 'Resisting change'],
        correctAnswer: 0,
        explanation: 'Continuous learning is crucial for professional growth.'
      },
      {
        question: `What characterizes ${request.difficulty} level knowledge?`,
        options: ['Deep understanding', 'Surface knowledge', 'No experience', 'Theoretical only'],
        correctAnswer: 0,
        explanation: `${request.difficulty} level requires comprehensive understanding.`
      }
    ];

    return defaultQuestions.map((q, i) => ({
      id: i + 1,
      question: q.question,
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
    console.log('Generating assessment questions for:', title, userContext);
    
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
      'JavaScript Programming': {
        beginner: [
          {
            question: 'Which keyword is used to declare a block-scoped variable in JavaScript?',
            options: ['var', 'let', 'const', 'define'],
            correctAnswer: 1,
            explanation: '`let` declares a block-scoped variable, while `var` is function-scoped and can cause issues with hoisting.'
          },
          {
            question: 'What is the output of `typeof null` in JavaScript?',
            options: ['"null"', '"undefined"', '"object"', '"boolean"'],
            correctAnswer: 2,
            explanation: '`typeof null` returns "object" due to a historical bug in JavaScript that has been kept for backward compatibility.'
          },
          {
            question: 'Which method is used to add an element to the end of an array?',
            options: ['push()', 'pop()', 'shift()', 'unshift()'],
            correctAnswer: 0,
            explanation: 'The push() method adds one or more elements to the end of an array and returns the new length.'
          },
          {
            question: 'What does the `===` operator do in JavaScript?',
            options: ['Assignment', 'Loose equality', 'Strict equality', 'Not equal'],
            correctAnswer: 2,
            explanation: 'The `===` operator checks for strict equality, comparing both value and type without type coercion.'
          },
          {
            question: 'Which of the following is NOT a primitive data type in JavaScript?',
            options: ['string', 'number', 'object', 'boolean'],
            correctAnswer: 2,
            explanation: 'Object is not a primitive data type. The primitive types are: string, number, boolean, undefined, null, symbol, and bigint.'
          }
        ],
        intermediate: [
          {
            question: 'What is a closure in JavaScript?',
            options: ['A way to close files', 'A function with access to outer scope', 'A loop termination', 'An error handling mechanism'],
            correctAnswer: 1,
            explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.'
          },
          {
            question: 'What does the `bind()` method do?',
            options: ['Calls a function immediately', 'Creates a new function with a specific `this` value', 'Binds two variables', 'Connects to a database'],
            correctAnswer: 1,
            explanation: 'The bind() method creates a new function with a specified `this` value and initial arguments.'
          }
        ],
        advanced: [
          {
            question: 'What is the purpose of the Event Loop in JavaScript?',
            options: ['Handle DOM events only', 'Manage asynchronous operations', 'Create loops', 'Handle errors'],
            correctAnswer: 1,
            explanation: 'The Event Loop manages the execution of asynchronous operations, allowing JavaScript to be non-blocking despite being single-threaded.'
          }
        ]
      },
      'React.js Framework': {
        beginner: [
          {
            question: 'What is JSX in React?',
            options: ['A JavaScript extension for XML-like syntax', 'A JSON parser', 'A state management library', 'A type checker'],
            correctAnswer: 0,
            explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.'
          },
          {
            question: 'Which method is used to render a React component?',
            options: ['ReactDOM.render()', 'React.render()', 'Component.render()', 'DOM.render()'],
            correctAnswer: 0,
            explanation: 'ReactDOM.render() is used to render React components into the DOM.'
          }
        ],
        intermediate: [
          {
            question: 'What is the purpose of useEffect hook?',
            options: ['Manage state', 'Handle side effects', 'Create components', 'Style components'],
            correctAnswer: 1,
            explanation: 'useEffect is used to handle side effects like API calls, subscriptions, and DOM manipulation.'
          }
        ],
        advanced: [
          {
            question: 'What is React Fiber?',
            options: ['A new component type', 'A reconciliation algorithm', 'A styling library', 'A testing framework'],
            correctAnswer: 1,
            explanation: 'React Fiber is a complete rewrite of React\'s reconciliation algorithm that enables features like time-slicing and suspense.'
          }
        ]
      },
      'Data Science': {
        beginner: [
          {
            question: 'What is the primary purpose of data cleaning?',
            options: ['To delete all data', 'To remove errors and inconsistencies', 'To encrypt data', 'To compress data'],
            correctAnswer: 1,
            explanation: 'Data cleaning involves identifying and correcting errors, inconsistencies, and inaccuracies in datasets.'
          }
        ],
        intermediate: [
          {
            question: 'What is overfitting in machine learning?',
            options: ['Model performs well on training but poorly on test data', 'Model performs poorly on all data', 'Model is too simple', 'Model has too few parameters'],
            correctAnswer: 0,
            explanation: 'Overfitting occurs when a model learns the training data too well, including noise, leading to poor generalization.'
          }
        ],
        advanced: [
          {
            question: 'What is the curse of dimensionality?',
            options: ['Too many features making analysis difficult', 'Not enough data', 'Poor data quality', 'Slow algorithms'],
            correctAnswer: 0,
            explanation: 'The curse of dimensionality refers to problems that arise when working with high-dimensional data, where distance metrics become less meaningful.'
          }
        ]
      },
      'AWS Cloud': {
        beginner: [
          {
            question: 'What does EC2 stand for in AWS?',
            options: ['Elastic Compute Cloud', 'Enhanced Cloud Computing', 'Elastic Container Cloud', 'Extended Compute Capacity'],
            correctAnswer: 0,
            explanation: 'EC2 stands for Elastic Compute Cloud, which provides scalable computing capacity in the AWS cloud.'
          }
        ],
        intermediate: [
          {
            question: 'What is the difference between S3 and EBS?',
            options: ['S3 is object storage, EBS is block storage', 'S3 is faster than EBS', 'S3 is more expensive', 'No difference'],
            correctAnswer: 0,
            explanation: 'S3 is object storage for files and static content, while EBS provides block-level storage for EC2 instances.'
          }
        ],
        advanced: [
          {
            question: 'What is AWS Lambda primarily used for?',
            options: ['Virtual machines', 'Serverless computing', 'Database management', 'Network routing'],
            correctAnswer: 1,
            explanation: 'AWS Lambda is a serverless computing service that runs code in response to events without managing servers.'
          }
        ]
      },
      'Cybersecurity': {
        beginner: [
          {
            question: 'What is the principle of least privilege?',
            options: ['Give users maximum access', 'Give users minimum necessary access', 'Remove all access', 'Give random access'],
            correctAnswer: 1,
            explanation: 'The principle of least privilege means giving users only the minimum access necessary to perform their job functions.'
          }
        ],
        intermediate: [
          {
            question: 'What is a zero-day vulnerability?',
            options: ['A vulnerability discovered on day zero', 'A vulnerability with no known fix', 'A vulnerability that takes zero days to exploit', 'A vulnerability in zero-day software'],
            correctAnswer: 1,
            explanation: 'A zero-day vulnerability is a security flaw that is unknown to security vendors and has no available patch or fix.'
          }
        ],
        advanced: [
          {
            question: 'What is the purpose of threat modeling?',
            options: ['To create threats', 'To identify and assess potential security threats', 'To model 3D threats', 'To threaten attackers'],
            correctAnswer: 1,
            explanation: 'Threat modeling is a process to identify, assess, and prioritize potential security threats and vulnerabilities in a system.'
          }
        ]
      },
      'UI/UX Design': {
        beginner: [
          {
            question: 'What does UX stand for?',
            options: ['User Experience', 'User Extension', 'Universal Experience', 'Unified Extension'],
            correctAnswer: 0,
            explanation: 'UX stands for User Experience, which encompasses all aspects of a user\'s interaction with a product or service.'
          }
        ],
        intermediate: [
          {
            question: 'What is the purpose of user personas?',
            options: ['To create fictional characters', 'To represent target user groups', 'To design avatars', 'To create user accounts'],
            correctAnswer: 1,
            explanation: 'User personas are fictional characters that represent different user types and help guide design decisions.'
          }
        ],
        advanced: [
          {
            question: 'What is the difference between usability testing and user testing?',
            options: ['No difference', 'Usability focuses on ease of use, user testing is broader', 'User testing is faster', 'Usability testing is more expensive'],
            correctAnswer: 1,
            explanation: 'Usability testing specifically focuses on how easy and efficient a product is to use, while user testing can encompass broader user research.'
          }
        ]
      }
    };
  }
}

export const llmService = new LLMService();