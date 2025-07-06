import React from 'react';
import { TrendingUp, Target, Award, Calendar, BookOpen, Clock, CheckCircle, Star } from 'lucide-react';
import { User, userStorage } from '../utils/userStorage';

interface ProgressTrackerProps {
  user: User;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ user }) => {
  // Get user-specific data
  const userActivities = userStorage.getUserActivities(user.id);
  const userAssessments = userStorage.getUserAssessmentResults(user.id);
  const userCertificates = userStorage.getUserCertificates(user.id);

  // Calculate overall progress
  const overallProgress = {
    completedCourses: userActivities.filter(a => a.type === 'course_completed').length + 6, // Add some base courses
    totalCourses: 24,
    completedHours: 156,
    totalHours: 200,
    averageScore: userAssessments.length > 0 
      ? Math.round(userAssessments.reduce((acc, result) => acc + result.score, 0) / userAssessments.length)
      : 0,
    streak: 15,
    badges: userCertificates.length,
    rank: 'Advanced Learner'
  };

  const weeklyProgress = [
    { week: 'Week 1', hours: 8, courses: 2, score: 85 },
    { week: 'Week 2', hours: 12, courses: 3, score: 89 },
    { week: 'Week 3', hours: 6, courses: 1, score: 92 },
    { week: 'Week 4', hours: 15, courses: 4, score: 84 },
    { week: 'Week 5', hours: 10, courses: 2, score: 88 },
    { week: 'Week 6', hours: 14, courses: 3, score: 91 }
  ];

  const skillProgress = [
    { skill: 'JavaScript', current: 85, target: 90, change: +5 },
    { skill: 'React', current: 78, target: 85, change: +8 },
    { skill: 'Node.js', current: 72, target: 80, change: +3 },
    { skill: 'Python', current: 65, target: 75, change: +12 },
    { skill: 'AWS', current: 58, target: 70, change: +15 },
    { skill: 'Docker', current: 45, target: 60, change: +7 }
  ];

  const recentAchievements = [
    ...userCertificates.slice(0, 2).map(cert => ({
      id: cert.id,
      title: cert.badge,
      description: `Completed ${cert.title}`,
      date: cert.completedDate,
      icon: '🏆',
      type: 'course'
    })),
    {
      id: 'streak',
      title: 'Streak Champion',
      description: '15-day learning streak',
      date: new Date().toISOString(),
      icon: '🔥',
      type: 'streak'
    },
    {
      id: 'helpful',
      title: 'Helpful Peer',
      description: 'Helped 5 colleagues this week',
      date: new Date(Date.now() - 86400000).toISOString(),
      icon: '🤝',
      type: 'social'
    }
  ];

  const learningGoals = [
    {
      id: 1,
      title: 'Complete Full Stack Development Path',
      progress: 75,
      target: 100,
      deadline: '2024-03-01',
      status: 'on-track'
    },
    {
      id: 2,
      title: 'Achieve AWS Certification',
      progress: 45,
      target: 100,
      deadline: '2024-04-15',
      status: 'behind'
    },
    {
      id: 3,
      title: 'Master Machine Learning Basics',
      progress: 30,
      target: 100,
      deadline: '2024-05-30',
      status: 'on-track'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Progress</h1>
        <p className="text-gray-600">Track your learning journey and celebrate your achievements</p>
      </div>

      {/* Overall Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Course Progress</p>
              <p className="text-2xl font-bold">
                {overallProgress.completedCourses}/{overallProgress.totalCourses}
              </p>
              <p className="text-blue-100 text-sm">
                {Math.round((overallProgress.completedCourses / overallProgress.totalCourses) * 100)}% Complete
              </p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Learning Hours</p>
              <p className="text-2xl font-bold">
                {overallProgress.completedHours}h
              </p>
              <p className="text-green-100 text-sm">
                {overallProgress.totalHours - overallProgress.completedHours}h remaining
              </p>
            </div>
            <Clock className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Average Score</p>
              <p className="text-2xl font-bold">{overallProgress.averageScore}%</p>
              <p className="text-purple-100 text-sm">
                {overallProgress.averageScore >= 80 ? 'Excellent!' : overallProgress.averageScore >= 70 ? 'Good work!' : 'Keep improving!'}
              </p>
            </div>
            <Star className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Learning Streak</p>
              <p className="text-2xl font-bold">{overallProgress.streak}</p>
              <p className="text-orange-100 text-sm">days in a row</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Progress Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Learning Activity</h2>
          <div className="space-y-4">
            {weeklyProgress.map((week, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{week.week}</span>
                    <span className="text-sm text-gray-600">{week.hours}h • {week.courses} courses</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" 
                      style={{width: `${(week.hours / 20) * 100}%`}}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-gray-900">{week.score}%</div>
                  <div className="text-xs text-gray-600">avg score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Skill Development</h2>
          <div className="space-y-4">
            {skillProgress.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{skill.current}%</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      skill.change > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {skill.change > 0 ? '+' : ''}{skill.change}%
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" 
                      style={{width: `${skill.current}%`}}
                    ></div>
                  </div>
                  <div 
                    className="absolute top-0 h-2 w-0.5 bg-gray-400"
                    style={{left: `${skill.target}%`}}
                    title={`Target: ${skill.target}%`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Learning Goals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Goals</h2>
          <div className="space-y-6">
            {learningGoals.map((goal) => (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    goal.status === 'on-track' ? 'bg-green-100 text-green-800' :
                    goal.status === 'behind' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {goal.status === 'on-track' ? 'On Track' :
                     goal.status === 'behind' ? 'Behind' : 'At Risk'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{goal.progress}% of {goal.target}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        goal.status === 'on-track' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        goal.status === 'behind' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      }`}
                      style={{width: `${goal.progress}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Set New Goal
          </button>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
          <div className="space-y-4">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(achievement.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  achievement.type === 'course' ? 'bg-blue-100 text-blue-800' :
                  achievement.type === 'streak' ? 'bg-orange-100 text-orange-800' :
                  achievement.type === 'quiz' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {achievement.type}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            View All Achievements
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;