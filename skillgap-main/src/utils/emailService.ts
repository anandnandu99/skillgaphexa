export interface EmailNotification {
  id: string;
  userId: string;
  type: 'registration' | 'assessment_completion' | 'certificate_earned' | 'course_enrollment' | 'course_completion';
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

class EmailService {
  private readonly NOTIFICATIONS_KEY = 'hexaware_email_notifications';

  // Send welcome email on registration
  sendWelcomeEmail(user: any): void {
    const notification: EmailNotification = {
      id: this.generateId(),
      userId: user.id,
      type: 'registration',
      subject: 'Welcome to Hexaware Learning Platform! 🎉',
      content: this.generateWelcomeEmailContent(user),
      timestamp: new Date().toISOString(),
      read: false
    };

    this.saveNotification(notification);
    this.showBrowserNotification('Welcome to Hexaware Learning!', 'Your account has been created successfully.');
  }

  // Send course enrollment email
  sendCourseEnrollmentEmail(user: any, course: any): void {
    const notification: EmailNotification = {
      id: this.generateId(),
      userId: user.id,
      type: 'course_enrollment',
      subject: `🎓 Successfully Enrolled: ${course.title}`,
      content: this.generateCourseEnrollmentEmailContent(user, course),
      timestamp: new Date().toISOString(),
      read: false
    };

    this.saveNotification(notification);
    this.showBrowserNotification('Course Enrollment Successful!', `You've enrolled in ${course.title}`);
  }

  // Send course completion email with certificate
  sendCourseCompletionEmail(user: any, course: any, certificate: any): void {
    const notification: EmailNotification = {
      id: this.generateId(),
      userId: user.id,
      type: 'course_completion',
      subject: `🎉 Course Completed: ${course.title} - Certificate Ready!`,
      content: this.generateCourseCompletionEmailContent(user, course, certificate),
      timestamp: new Date().toISOString(),
      read: false
    };

    this.saveNotification(notification);
    this.showBrowserNotification('Course Completed!', `Congratulations! You've completed ${course.title} and earned a certificate!`);
  }

  // Send assessment completion email
  sendAssessmentCompletionEmail(user: any, assessmentResult: any): void {
    const notification: EmailNotification = {
      id: this.generateId(),
      userId: user.id,
      type: 'assessment_completion',
      subject: `Assessment Results: ${assessmentResult.title} - ${assessmentResult.status === 'passed' ? 'Congratulations!' : 'Keep Learning!'}`,
      content: this.generateAssessmentEmailContent(user, assessmentResult),
      timestamp: new Date().toISOString(),
      read: false
    };

    this.saveNotification(notification);
    
    const message = assessmentResult.status === 'passed' 
      ? `Congratulations! You scored ${assessmentResult.score}% on ${assessmentResult.title}`
      : `You scored ${assessmentResult.score}% on ${assessmentResult.title}. Keep practicing!`;
    
    this.showBrowserNotification('Assessment Complete', message);
  }

  // Send certificate earned email
  sendCertificateEmail(user: any, certificate: any): void {
    const notification: EmailNotification = {
      id: this.generateId(),
      userId: user.id,
      type: 'certificate_earned',
      subject: `🎓 Certificate Earned: ${certificate.badge}`,
      content: this.generateCertificateEmailContent(user, certificate),
      timestamp: new Date().toISOString(),
      read: false
    };

    this.saveNotification(notification);
    this.showBrowserNotification('Certificate Earned!', `You've earned the ${certificate.badge} certificate!`);
  }

  // Get user notifications
  getUserNotifications(userId: string): EmailNotification[] {
    const notifications = this.getAllNotifications();
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get unread count
  getUnreadCount(userId: string): number {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }

  // Mark as read
  markAsRead(notificationId: string): void {
    const notifications = this.getAllNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  }

  private saveNotification(notification: EmailNotification): void {
    const notifications = this.getAllNotifications();
    notifications.push(notification);
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  private getAllNotifications(): EmailNotification[] {
    const notifications = localStorage.getItem(this.NOTIFICATIONS_KEY);
    return notifications ? JSON.parse(notifications) : [];
  }

  private generateWelcomeEmailContent(user: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center; color: white;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">Welcome to Hexaware Learning! 🎉</h1>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your learning journey starts here</p>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            Welcome to the Hexaware Learning Platform! We're excited to have you join our community of learners.
          </p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Your Account Details:</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${user.name}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Role:</strong> ${user.role}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Department:</strong> ${user.department}</p>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">What's Next?</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            <li>Complete your profile to get personalized recommendations</li>
            <li>Take your first skill assessment to identify learning opportunities</li>
            <li>Explore our course catalog with AI-powered suggestions</li>
            <li>Join study groups to connect with peers</li>
            <li>Track your progress and earn certificates</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Start Learning Now →
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
            Happy learning!<br>
            The Hexaware Learning Team
          </p>
        </div>
      </div>
    `;
  }

  private generateCourseEnrollmentEmailContent(user: any, course: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center; color: white;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">Course Enrollment Successful! 🎓</h1>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">${course.title}</p>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            Congratulations! You've successfully enrolled in <strong>${course.title}</strong>. Your learning journey begins now!
          </p>
          
          <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
            <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 24px;">${course.title}</h3>
            <p style="color: #065f46; margin: 0; font-size: 16px;">by ${course.instructor}</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #10b981;">
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                <div>
                  <div style="font-size: 18px; font-weight: bold; color: #065f46;">${course.duration}</div>
                  <div style="color: #065f46; font-size: 12px;">Duration</div>
                </div>
                <div>
                  <div style="font-size: 18px; font-weight: bold; color: #065f46;">${course.totalLessons}</div>
                  <div style="color: #065f46; font-size: 12px;">Lessons</div>
                </div>
                <div>
                  <div style="font-size: 18px; font-weight: bold; color: #065f46;">${course.level}</div>
                  <div style="color: #065f46; font-size: 12px;">Level</div>
                </div>
              </div>
            </div>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">What You'll Learn:</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            ${course.learningObjectives.slice(0, 3).map((obj: string) => `<li>${obj}</li>`).join('')}
          </ul>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">Getting Started:</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            <li>Access your course materials anytime from your dashboard</li>
            <li>Watch video lessons at your own pace</li>
            <li>Complete hands-on exercises and projects</li>
            <li>Track your progress and earn a certificate upon completion</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Start Learning Now →
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
            Happy learning!<br>
            The Hexaware Learning Team
          </p>
        </div>
      </div>
    `;
  }

  private generateCourseCompletionEmailContent(user: any, course: any, certificate: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 12px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center; color: white;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">Course Completed! 🎉</h1>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">Certificate Ready for Download</p>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Congratulations ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            You've successfully completed <strong>${course.title}</strong>! This is a significant achievement that demonstrates your dedication to learning and professional growth.
          </p>
          
          <div style="background: #fffbeb; border: 2px solid #fbbf24; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">🏆</div>
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 24px;">${certificate.badge}</h3>
            <p style="color: #92400e; margin: 0; font-size: 16px;">Certificate of Completion</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #fbbf24;">
              <p style="margin: 5px 0; color: #92400e;"><strong>Course:</strong> ${course.title}</p>
              <p style="margin: 5px 0; color: #92400e;"><strong>Instructor:</strong> ${course.instructor}</p>
              <p style="margin: 5px 0; color: #92400e;"><strong>Certificate ID:</strong> ${certificate.certificateId}</p>
              <p style="margin: 5px 0; color: #92400e;"><strong>Completion Date:</strong> ${new Date(certificate.completedDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">What You've Accomplished:</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            <li>Completed all ${course.totalLessons} lessons in the course</li>
            <li>Mastered key concepts in ${course.category}</li>
            <li>Gained practical skills applicable to your role</li>
            <li>Earned a verified certificate of completion</li>
          </ul>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">Next Steps:</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            <li>Download your certificate from your profile</li>
            <li>Add this achievement to your LinkedIn profile</li>
            <li>Share your success with colleagues and friends</li>
            <li>Explore advanced courses to continue learning</li>
            <li>Apply your new skills in real-world projects</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
              Download Certificate
            </a>
            <a href="#" style="background: #1d4ed8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Continue Learning
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
            Congratulations on this achievement!<br>
            The Hexaware Learning Team
          </p>
        </div>
      </div>
    `;
  }

  private generateAssessmentEmailContent(user: any, result: any): string {
    const isPassed = result.status === 'passed';
    const gradientColor = isPassed ? '#10b981, #059669' : '#ef4444, #dc2626';
    const statusIcon = isPassed ? '🎉' : '📚';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, ${gradientColor}); border-radius: 12px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center; color: white;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">Assessment Complete! ${statusIcon}</h1>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">${result.title}</p>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            ${isPassed 
              ? `Congratulations! You've successfully completed the ${result.title} assessment.`
              : `You've completed the ${result.title} assessment. Keep practicing to improve your score!`
            }
          </p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Your Results:</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: ${isPassed ? '#10b981' : '#ef4444'};">${result.score}%</div>
                <div style="color: #666; font-size: 14px;">Your Score</div>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #6366f1;">${result.percentile}th</div>
                <div style="color: #666; font-size: 14px;">Percentile</div>
              </div>
            </div>
            <div style="margin-top: 15px; text-align: center;">
              <p style="margin: 5px 0; color: #666;"><strong>Questions Correct:</strong> ${result.correctAnswers}/${result.totalQuestions}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Time Spent:</strong> ${result.timeSpent}</p>
              ${result.badge ? `<p style="margin: 5px 0; color: #666;"><strong>Badge Earned:</strong> ${result.badge} 🏆</p>` : ''}
            </div>
          </div>
          
          ${isPassed ? `
            <div style="background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #166534; margin: 0 0 10px 0;">🎉 Congratulations!</h3>
              <p style="color: #166534; margin: 0;">You've passed the assessment and earned the "${result.badge}" badge!</p>
              ${result.certificateId ? '<p style="color: #166534; margin: 10px 0 0 0;">Your certificate is ready for download.</p>' : ''}
            </div>
          ` : `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #991b1b; margin: 0 0 10px 0;">Keep Learning!</h3>
              <p style="color: #991b1b; margin: 0;">Don't worry! Review the material and try again when you're ready.</p>
            </div>
          `}
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">What's Next?</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            ${isPassed ? `
              <li>Download your certificate from your profile</li>
              <li>Share your achievement on LinkedIn</li>
              <li>Explore advanced courses in this topic</li>
            ` : `
              <li>Review the assessment explanations</li>
              <li>Take recommended courses to improve</li>
              <li>Retake the assessment when ready</li>
            `}
            <li>Continue your learning journey with new assessments</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, ${gradientColor}); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ${isPassed ? 'View Certificate' : 'Continue Learning'} →
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
            Keep up the great work!<br>
            The Hexaware Learning Team
          </p>
        </div>
      </div>
    `;
  }

  private generateCertificateEmailContent(user: any, certificate: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 12px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center; color: white;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">Certificate Earned! 🎓</h1>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">${certificate.badge}</p>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Congratulations ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            You've successfully earned the <strong>${certificate.badge}</strong> certificate! This is a significant achievement that demonstrates your expertise and commitment to learning.
          </p>
          
          <div style="background: #fffbeb; border: 2px solid #fbbf24; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">🏆</div>
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 24px;">${certificate.badge}</h3>
            <p style="color: #92400e; margin: 0; font-size: 16px;">Certificate of Achievement</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #fbbf24;">
              <p style="margin: 5px 0; color: #92400e;"><strong>Assessment:</strong> ${certificate.title}</p>
              <p style="margin: 5px 0; color: #92400e;"><strong>Score:</strong> ${certificate.score}%</p>
              <p style="margin: 5px 0; color: #92400e;"><strong>Certificate ID:</strong> ${certificate.certificateId}</p>
              <p style="margin: 5px 0; color: #92400e;"><strong>Date Earned:</strong> ${new Date(certificate.completedDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">What You Can Do:</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            <li>Download your official certificate PDF</li>
            <li>Add this achievement to your LinkedIn profile</li>
            <li>Share your success with colleagues and friends</li>
            <li>Use this credential to advance your career</li>
            <li>Continue learning with advanced courses</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
              Download Certificate
            </a>
            <a href="#" style="background: #1d4ed8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Share on LinkedIn
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
            Congratulations on this achievement!<br>
            The Hexaware Learning Team
          </p>
        </div>
      </div>
    `;
  }

  private showBrowserNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      });
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export const emailService = new EmailService();