import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target, TrendingUp, Award, Clock, Users, CheckCircle, Star, Settings } from 'lucide-react';
import { User, userStorage } from '../utils/userStorage';
import CourseManager from '../components/CourseManager';

interface HomePageProps {
  user: User;
}

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [showCourseManager, setShowCourseManager] = React.useState(false);
  
  // Get user-specific data
  const userActivities = userStorage.getUserActivities(user.id);
  const userAssessments = userStorage.getUserAssessmentResults(user.id);
  const userCertificates = userStorage.getUserCertificates(user.id);

  // Calculate stats
  const completedCourses = userActivities.filter(a => a.type === 'course_completed').length;
  const passedAssessments = userAssessments.filter(a => a.status === 'passed').length;
  const averageScore = userAssessments.length > 0 
    ? Math.round(userAssessments.reduce((acc, result) => acc + result.score, 0) / userAssessments.length)
    : 0;

  // Recent activity (last 10 items)
  const recentActivity = userActivities.slice(0, 10);

  // Show course manager if requested
  if (showCourseManager) {
    return <CourseManager onClose={() => setShowCourseManager(false)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Continue your personalized learning journey with AI-powered skill development and assessment tracking.
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Courses Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
              <p className="text-xs text-green-600">Keep learning!</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assessments Passed</p>
              <p className="text-2xl font-bold text-gray-900">{passedAssessments}</p>
              <p className="text-xs text-green-600">
                {userAssessments.length > 0 ? `${Math.round((passedAssessments / userAssessments.length) * 100)}% success rate` : 'Start your first assessment'}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates Earned</p>
              <p className="text-2xl font-bold text-gray-900">{userCertificates.length}</p>
              <p className="text-xs text-blue-600">Verified credentials</p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              <p className="text-xs text-orange-600">
                {averageScore >= 80 ? 'Excellent!' : averageScore >= 70 ? 'Good work!' : 'Keep improving!'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Admin Panel for Course Management */}
      {(user.role === 'Admin' || user.role === 'Instructor' || user.email === 'john.doe@hexaware.com') && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Course Management</h3>
              <p className="text-purple-700">Create and manage courses, modules, and YouTube video content</p>
            </div>
            <button
              onClick={() => setShowCourseManager(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>Manage Courses</span>
            </button>
          </div>
        </div>
      )}

      {/* Current Learning Path */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Journey</h2>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Personalized Learning Path</h3>
              <p className="text-gray-600">Based on your role as {user.role} in {user.department}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{Math.min(completedCourses * 10, 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: `${Math.min(completedCourses * 10, 100)}%`}}></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Continue your learning journey</span>
            </div>
            <Link 
              to="/continue-learning"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link to="/continue-learning" className="group">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Continue Learning</h3>
            <p className="text-gray-600 mb-4">Resume your courses and track your progress</p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>View Progress</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link to="/explore-courses" className="group">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Explore Courses</h3>
            <p className="text-gray-600 mb-4">Discover new courses with AI-powered recommendations</p>
            <div className="flex items-center text-green-600 font-medium">
              <span>Browse Catalog</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link to="/skill-assessment" className="group">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill Assessment</h3>
            <p className="text-gray-600 mb-4">Test your knowledge and earn certificates</p>
            <div className="flex items-center text-purple-600 font-medium">
              <span>Start Assessment</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <Link to="/profile" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Activity →
          </Link>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600 mb-4">Start your learning journey by taking an assessment or exploring courses</p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/skill-assessment"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Take Assessment
              </Link>
              <Link 
                to="/explore-courses"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl">
                  {activity.type === 'assessment_completed' && '🏆'}
                  {activity.type === 'course_completed' && '📚'}
                  {activity.type === 'certificate_earned' && '🎓'}
                  {activity.type === 'study_group_joined' && '👥'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">
                    {activity.type === 'assessment_completed' && `Score: ${activity.data.score}% - ${activity.data.status}`}
                    {activity.type === 'course_completed' && 'Course completed successfully'}
                    {activity.type === 'certificate_earned' && `Certificate ID: ${activity.data.certificateId}`}
                    {activity.type === 'study_group_joined' && `${activity.data.members} members`}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;