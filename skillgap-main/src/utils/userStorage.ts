export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  location: string;
  joinDate: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  title: string;
  score: number;
  maxScore: number;
  completedDate: string;
  status: 'passed' | 'failed';
  percentile: number;
  badge: string | null;
  timeSpent: string;
  correctAnswers: number;
  totalQuestions: number;
  certificateId: string | null;
  difficulty: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'assessment_completed' | 'course_completed' | 'certificate_earned' | 'study_group_joined'|'course_enrolled';
  title: string;
  timestamp: string;
  data: any;
}

export interface Certificate {
  id: string;
  userId: string;
  assessmentId?: string;
  title: string;
  badge: string;
  score: number;
  completedDate: string;
  certificateId: string;
}

class UserStorage {
  private readonly USERS_KEY = 'hexaware_users';
  private readonly CURRENT_USER_KEY = 'hexaware_current_user';
  private readonly ASSESSMENT_RESULTS_KEY = 'hexaware_assessment_results';
  private readonly ACTIVITIES_KEY = 'hexaware_activities';
  private readonly CERTIFICATES_KEY = 'hexaware_certificates';

  // User Management
  saveUser(user: User): void {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  getAllUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  getUserById(id: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Assessment Results
  saveAssessmentResult(result: AssessmentResult): void {
    const results = this.getAllAssessmentResults();
    results.push(result);
    localStorage.setItem(this.ASSESSMENT_RESULTS_KEY, JSON.stringify(results));
  }

  getAllAssessmentResults(): AssessmentResult[] {
    const results = localStorage.getItem(this.ASSESSMENT_RESULTS_KEY);
    return results ? JSON.parse(results) : [];
  }

  getUserAssessmentResults(userId: string): AssessmentResult[] {
    const results = this.getAllAssessmentResults();
    return results.filter(result => result.userId === userId);
  }

  // Activities
  saveActivity(activity: Activity): void {
    const activities = this.getAllActivities();
    activities.unshift(activity); // Add to beginning for recent first
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
  }

  getAllActivities(): Activity[] {
    const activities = localStorage.getItem(this.ACTIVITIES_KEY);
    return activities ? JSON.parse(activities) : [];
  }

  getUserActivities(userId: string): Activity[] {
    const activities = this.getAllActivities();
    return activities.filter(activity => activity.userId === userId);
  }

  // Certificates
  saveCertificate(certificate: Certificate): void {
    const certificates = this.getAllCertificates();
    certificates.push(certificate);
    localStorage.setItem(this.CERTIFICATES_KEY, JSON.stringify(certificates));
  }

  getAllCertificates(): Certificate[] {
    const certificates = localStorage.getItem(this.CERTIFICATES_KEY);
    return certificates ? JSON.parse(certificates) : [];
  }

  getUserCertificates(userId: string): Certificate[] {
    const certificates = this.getAllCertificates();
    return certificates.filter(cert => cert.userId === userId);
  }

  // Authentication
  authenticateUser(email: string, password: string): User | null {
    const user = this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  registerUser(userData: Omit<User, 'id' | 'joinDate'>): User {
    const user: User = {
      ...userData,
      id: this.generateId(),
      joinDate: new Date().toISOString()
    };
    
    this.saveUser(user);
    return user;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export const userStorage = new UserStorage();