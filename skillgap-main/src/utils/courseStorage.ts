export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorBio: string;
  instructorAvatar: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  totalLessons: number;
  price: number;
  rating: number;
  students: number;
  thumbnail: string;
  tags: string[];
  learningObjectives: string[];
  prerequisites: string[];
  syllabus: CourseModule[];
  createdDate: string;
  lastUpdated: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz?: Quiz;
  assignment?: Assignment;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'interactive' | 'quiz';
  duration: string;
  content: string;
  videoUrl?: string;
  resources?: Resource[];
  completed: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'code' | 'image';
  url: string;
  description: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  dueDate?: string;
  submissionType: 'file' | 'text' | 'code';
  maxScore: number;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledDate: string;
  progress: number;
  completedLessons: string[];
  currentLesson?: string;
  lastAccessedDate: string;
  certificateEarned: boolean;
  finalScore?: number;
}

export interface LessonProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedDate?: string;
  timeSpent: number;
  notes?: string;
}

export interface AssignmentSubmission {
  id: string;
  userId: string;
  courseId: string;
  assignmentId: string;
  submissionDate: string;
  content: string;
  fileUrl?: string;
  score?: number;
  feedback?: string;
  graded: boolean;
}

class CourseStorage {
  private readonly COURSES_KEY = 'hexaware_courses';
  private readonly ENROLLMENTS_KEY = 'hexaware_enrollments';
  private readonly LESSON_PROGRESS_KEY = 'hexaware_lesson_progress';
  private readonly SUBMISSIONS_KEY = 'hexaware_submissions';

  constructor() {
    this.initializeSampleCourses();
  }

  // Course Management
  getAllCourses(): Course[] {
    const courses = localStorage.getItem(this.COURSES_KEY);
    return courses ? JSON.parse(courses) : [];
  }

  getCourseById(courseId: string): Course | null {
    const courses = this.getAllCourses();
    return courses.find(course => course.id === courseId) || null;
  }

  saveCourse(course: Course): void {
    const courses = this.getAllCourses();
    const existingIndex = courses.findIndex(c => c.id === course.id);
    
    if (existingIndex >= 0) {
      courses[existingIndex] = course;
    } else {
      courses.push(course);
    }
    
    localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
  }

  deleteCourse(courseId: string): void {
    const courses = this.getAllCourses();
    const filteredCourses = courses.filter(course => course.id !== courseId);
    localStorage.setItem(this.COURSES_KEY, JSON.stringify(filteredCourses));
  }

  getCoursesByCategory(category: string): Course[] {
    const courses = this.getAllCourses();
    return courses.filter(course => course.category === category);
  }

  searchCourses(query: string): Course[] {
    const courses = this.getAllCourses();
    const lowercaseQuery = query.toLowerCase();
    return courses.filter(course => 
      course.title.toLowerCase().includes(lowercaseQuery) ||
      course.description.toLowerCase().includes(lowercaseQuery) ||
      course.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      course.instructor.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Enrollment Management
  enrollUserInCourse(userId: string, courseId: string): CourseEnrollment {
    const enrollment: CourseEnrollment = {
      id: this.generateId(),
      userId,
      courseId,
      enrolledDate: new Date().toISOString(),
      progress: 0,
      completedLessons: [],
      lastAccessedDate: new Date().toISOString(),
      certificateEarned: false
    };

    const enrollments = this.getAllEnrollments();
    enrollments.push(enrollment);
    localStorage.setItem(this.ENROLLMENTS_KEY, JSON.stringify(enrollments));
    
    return enrollment;
  }

  getUserEnrollments(userId: string): CourseEnrollment[] {
    const enrollments = this.getAllEnrollments();
    return enrollments.filter(enrollment => enrollment.userId === userId);
  }

  getUserEnrollment(userId: string, courseId: string): CourseEnrollment | null {
    const enrollments = this.getUserEnrollments(userId);
    return enrollments.find(enrollment => enrollment.courseId === courseId) || null;
  }

  updateEnrollmentProgress(userId: string, courseId: string, lessonId: string): void {
    const enrollments = this.getAllEnrollments();
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    
    if (enrollment) {
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
      }
      
      const course = this.getCourseById(courseId);
      if (course) {
        const totalLessons = course.syllabus.reduce((total, module) => total + module.lessons.length, 0);
        enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      }
      
      enrollment.lastAccessedDate = new Date().toISOString();
      localStorage.setItem(this.ENROLLMENTS_KEY, JSON.stringify(enrollments));
    }
  }

  markCertificateEarned(userId: string, courseId: string): void {
    const enrollments = this.getAllEnrollments();
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    
    if (enrollment) {
      enrollment.certificateEarned = true;
      localStorage.setItem(this.ENROLLMENTS_KEY, JSON.stringify(enrollments));
    }
  }

  // Lesson Progress
  saveLessonProgress(progress: LessonProgress): void {
    const allProgress = this.getAllLessonProgress();
    const existingIndex = allProgress.findIndex(p => 
      p.userId === progress.userId && 
      p.courseId === progress.courseId && 
      p.lessonId === progress.lessonId
    );

    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }

    localStorage.setItem(this.LESSON_PROGRESS_KEY, JSON.stringify(allProgress));
  }

  getLessonProgress(userId: string, courseId: string, lessonId: string): LessonProgress | null {
    const allProgress = this.getAllLessonProgress();
    return allProgress.find(p => 
      p.userId === userId && 
      p.courseId === courseId && 
      p.lessonId === lessonId
    ) || null;
  }

  getUserCourseProgress(userId: string, courseId: string): LessonProgress[] {
    const allProgress = this.getAllLessonProgress();
    return allProgress.filter(p => p.userId === userId && p.courseId === courseId);
  }

  // Assignment Submissions
  saveAssignmentSubmission(submission: AssignmentSubmission): void {
    const submissions = this.getAllSubmissions();
    const existingIndex = submissions.findIndex(s => 
      s.userId === submission.userId && 
      s.assignmentId === submission.assignmentId
    );

    if (existingIndex >= 0) {
      submissions[existingIndex] = submission;
    } else {
      submissions.push(submission);
    }

    localStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(submissions));
  }

  getUserSubmissions(userId: string, courseId: string): AssignmentSubmission[] {
    const submissions = this.getAllSubmissions();
    return submissions.filter(s => s.userId === userId && s.courseId === courseId);
  }

  // Private helper methods
  private getAllEnrollments(): CourseEnrollment[] {
    const enrollments = localStorage.getItem(this.ENROLLMENTS_KEY);
    return enrollments ? JSON.parse(enrollments) : [];
  }

  private getAllLessonProgress(): LessonProgress[] {
    const progress = localStorage.getItem(this.LESSON_PROGRESS_KEY);
    return progress ? JSON.parse(progress) : [];
  }

  private getAllSubmissions(): AssignmentSubmission[] {
    const submissions = localStorage.getItem(this.SUBMISSIONS_KEY);
    return submissions ? JSON.parse(submissions) : [];
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private initializeSampleCourses(): void {
    const existingCourses = this.getAllCourses();
    if (existingCourses.length === 0) {
      const sampleCourses: Course[] = [
        {
          id: '1',
          title: 'Advanced Machine Learning with Python',
          description: 'Master advanced ML algorithms and techniques for real-world applications. This comprehensive course covers deep learning, neural networks, and practical implementation using Python.',
          instructor: 'Dr. Sarah Chen',
          instructorBio: 'Dr. Sarah Chen is a Senior Data Scientist with over 10 years of experience in machine learning and AI. She has published numerous research papers and worked at leading tech companies.',
          instructorAvatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150',
          category: 'data-science',
          level: 'advanced',
          duration: '8 weeks',
          totalLessons: 4,
          price: 149,
          rating: 4.9,
          students: 12500,
          thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
          tags: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'Neural Networks'],
          learningObjectives: [
            'Understand advanced ML algorithms and their applications',
            'Implement neural networks from scratch using Python',
            'Work with real-world datasets and preprocessing techniques',
            'Deploy ML models to production environments',
            'Optimize model performance and handle large-scale data'
          ],
          prerequisites: [
            'Basic Python programming knowledge',
            'Understanding of statistics and linear algebra',
            'Familiarity with basic machine learning concepts'
          ],
          syllabus: [
            {
              id: 'module-1',
              title: 'Introduction to Advanced ML',
              description: 'Overview of advanced machine learning concepts and setup',
              lessons: [
                {
                  id: 'lesson-1-1',
                  title: 'Course Overview and Setup',
                  type: 'video',
                  duration: '15 min',
                  content: 'Welcome to Advanced Machine Learning! In this lesson, we\'ll cover what you\'ll learn and set up your development environment.',
                  videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
                  completed: false,
                  resources: [
                    {
                      id: 'resource-1',
                      title: 'Course Syllabus',
                      type: 'pdf',
                      url: 'https://example.com/syllabus.pdf',
                      description: 'Complete course outline and schedule'
                    }
                  ]
                },
                {
                  id: 'lesson-1-2',
                  title: 'Advanced ML Landscape',
                  type: 'video',
                  duration: '19 min',
                  content: 'Explore the current state of machine learning and emerging trends.',
                  videoUrl: 'https://www.youtube.com/watch?v=Mph0cWZsoV4',
                  completed: false
                }
              ]
            },
            {
              id: 'module-2',
              title: 'Deep Learning Fundamentals',
              description: 'Core concepts of deep learning and neural networks',
              lessons: [
                {
                  id: 'lesson-2-1',
                  title: 'Neural Network Architecture',
                  type: 'video',
                  duration: '30 min',
                  content: 'Deep dive into neural network architectures and design principles.',
                  videoUrl: 'https://www.youtube.com/watch?v=I2PaZIweWMs',
                  completed: false
                },
                {
                  id: 'lesson-2-2',
                  title: 'Backpropagation Algorithm',
                  type: 'video',
                  duration: '35 min',
                  content: 'Understanding how neural networks learn through backpropagation.',
                  videoUrl: 'https://www.youtube.com/watch?v=Ilg3gGewQ5U',
                  completed: false
                }
              ],
              quiz: {
                id: 'quiz-2',
                title: 'Deep Learning Fundamentals Quiz',
                passingScore: 80,
                questions: [
                  {
                    id: 'q1',
                    question: 'What is the primary purpose of backpropagation?',
                    type: 'multiple-choice',
                    options: [
                      'To initialize weights',
                      'To update weights based on error',
                      'To activate neurons',
                      'To normalize inputs'
                    ],
                    correctAnswer: 1,
                    explanation: 'Backpropagation is used to update weights by propagating errors backward through the network.'
                  }
                ]
              }
            }
          ],
          createdDate: '2024-01-01T00:00:00Z',
          lastUpdated: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          title: 'React Native Mobile App Development',
          description: 'Build cross-platform mobile apps with React Native. Learn to create native iOS and Android applications using JavaScript and React.',
          instructor: 'Mike Johnson',
          instructorBio: 'Mike Johnson is a Senior Mobile Developer with expertise in React Native, iOS, and Android development. He has built apps for Fortune 500 companies.',
          instructorAvatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=150',
          category: 'mobile',
          level: 'intermediate',
          duration: '6 weeks',
          totalLessons: 4,
          price: 129,
          rating: 4.7,
          students: 8900,
          thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
          tags: ['React Native', 'JavaScript', 'Mobile Development', 'iOS', 'Android'],
          learningObjectives: [
            'Build cross-platform mobile applications',
            'Master React Native components and navigation',
            'Integrate with device APIs and third-party services',
            'Publish apps to App Store and Google Play',
            'Implement responsive design for mobile devices'
          ],
          prerequisites: [
            'Basic React knowledge',
            'JavaScript ES6+ proficiency',
            'Understanding of mobile app concepts'
          ],
          syllabus: [
            {
              id: 'module-1',
              title: 'Getting Started with React Native',
              description: 'Introduction to React Native and development setup',
              lessons: [
                {
                  id: 'lesson-1-1',
                  title: 'React Native Overview',
                  type: 'video',
                  duration: '20 min',
                  content: 'Introduction to React Native and its advantages for mobile development.',
                  videoUrl: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
                  completed: false
                },
                {
                  id: 'lesson-1-2',
                  title: 'Development Environment Setup',
                  type: 'video',
                  duration: '30 min',
                  content: 'Step-by-step guide to setting up your React Native development environment.',
                  videoUrl: 'https://www.youtube.com/watch?v=VozPNrt-LfE',
                  completed: false
                }
              ]
            },
            {
              id: 'module-2',
              title: 'Building Your First App',
              description: 'Create your first React Native application',
              lessons: [
                {
                  id: 'lesson-2-1',
                  title: 'Creating Components',
                  type: 'video',
                  duration: '25 min',
                  content: 'Learn how to create and style React Native components.',
                  videoUrl: 'https://www.youtube.com/watch?v=ur6I5m2nTvk',
                  completed: false
                },
                {
                  id: 'lesson-2-2',
                  title: 'Navigation Basics',
                  type: 'video',
                  duration: '35 min',
                  content: 'Implement navigation between screens in your app.',
                  videoUrl: 'https://www.youtube.com/watch?v=nQVCkqvU1uE',
                  completed: false
                }
              ]
            }
          ],
          createdDate: '2024-01-05T00:00:00Z',
          lastUpdated: '2024-01-20T00:00:00Z'
        },
        {
          id: '3',
          title: 'Full Stack JavaScript Development',
          description: 'Complete MERN stack development from frontend to backend. Build modern web applications using MongoDB, Express, React, and Node.js.',
          instructor: 'Lisa Zhang',
          instructorBio: 'Lisa Zhang is a Full Stack Developer and Technical Lead with 8 years of experience building scalable web applications.',
          instructorAvatar: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=150',
          category: 'development',
          level: 'intermediate',
          duration: '12 weeks',
          totalLessons: 4,
          price: 179,
          rating: 4.8,
          students: 11200,
          thumbnail: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
          tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Full Stack'],
          learningObjectives: [
            'Build complete full-stack web applications',
            'Master the MERN technology stack',
            'Implement authentication and authorization',
            'Deploy applications to cloud platforms',
            'Follow best practices for scalable development'
          ],
          prerequisites: [
            'HTML, CSS, and JavaScript fundamentals',
            'Basic understanding of databases',
            'Familiarity with command line interface'
          ],
          syllabus: [
            {
              id: 'module-1',
              title: 'Frontend Development with React',
              description: 'Building modern user interfaces with React',
              lessons: [
                {
                  id: 'lesson-1-1',
                  title: 'React Fundamentals',
                  type: 'video',
                  duration: '45 min',
                  content: 'Core React concepts including components, props, and state.',
                  videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
                  completed: false
                },
                {
                  id: 'lesson-1-2',
                  title: 'React Hooks Deep Dive',
                  type: 'video',
                  duration: '40 min',
                  content: 'Master React hooks for state management and side effects.',
                  videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
                  completed: false
                }
              ]
            },
            {
              id: 'module-2',
              title: 'Backend Development with Node.js',
              description: 'Building robust server-side applications',
              lessons: [
                {
                  id: 'lesson-2-1',
                  title: 'Node.js and Express Setup',
                  type: 'video',
                  duration: '35 min',
                  content: 'Setting up a Node.js server with Express framework.',
                  videoUrl: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
                  completed: false
                },
                {
                  id: 'lesson-2-2',
                  title: 'RESTful API Development',
                  type: 'video',
                  duration: '50 min',
                  content: 'Creating RESTful APIs with proper routing and middleware.',
                  videoUrl: 'https://www.youtube.com/watch?v=l8WPWK9mS5M',
                  completed: false
                }
              ]
            }
          ],
          createdDate: '2024-01-10T00:00:00Z',
          lastUpdated: '2024-01-25T00:00:00Z'
        }
      ];

      localStorage.setItem(this.COURSES_KEY, JSON.stringify(sampleCourses));
    }
  }
}

export const courseStorage = new CourseStorage();