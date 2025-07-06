import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, CheckCircle, BookOpen, Award, Cross as Progress, Calendar, Target } from 'lucide-react';
import { User, userStorage } from '../utils/userStorage';
import { courseStorage, CourseEnrollment, Course } from '../utils/courseStorage';

interface ContinueLearningProps {
  user: User;
}

const ContinueLearning: React.FC<ContinueLearningProps> = ({ user }) => {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<(CourseEnrollment & { course: Course })[]>([]);
  const [completedCourses, setCompletedCourses] = useState<(CourseEnrollment & { course: Course })[]>([]);

  // Get user-specific data
  const userActivities = userStorage.getUserActivities(user.id);
  const userAssessments = userStorage.getUserAssessmentResults(user.id);
  const userCertificates = userStorage.getUserCertificates(user.id);

  useEffect(() => {
    loadUserCourses();
  }, [user.id]);

  const loadUserCourses = () => {
    const userEnrollments = courseStorage.getUserEnrollments(user.id);
    setEnrollments(userEnrollments);

    const courses = userEnrollments.map(enrollment => {
      const course = courseStorage.getCourseById(enrollment.courseId);
      return course ? { ...enrollment, course } : null;
    }).filter(Boolean) as (CourseEnrollment & { course: Course })[];

    setEnrolledCourses(courses.map(c => c.course));
    setInProgressCourses(courses.filter(c => c.progress < 100));
    setCompletedCourses(courses.filter(c => c.progress === 100));
  };

  const continueLesson = (courseId: string) => {
    // Navigate to course detail page
    window.location.href = `/course/${courseId}`;
  };

  // Calculate stats
  const totalEnrolledCourses = enrollments.length;
  const completedCoursesCount = completedCourses.length;
  const quizzesTaken = userAssessments.length;
  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, enrollment) => acc + enrollment.progress, 0) / enrollments.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Continue Learning</h1>
        <p className="text-gray-600">Pick up where you left off and keep building your skills</p>
      </div>

      {/* Learning Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Enrolled Courses</p>
              <p className="text-3xl font-bold">{totalEnrolledCourses}</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completed Courses</p>
              <p className="text-3xl font-bold">{completedCoursesCount}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Average Progress</p>
              <p className="text-3xl font-bold">{averageProgress}%</p>
            </div>
            <Progress className="w-10 h-10 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Assessments Taken</p>
              <p className="text-3xl font-bold">{quizzesTaken}</p>
            </div>
            <Award className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/explore-courses"
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Explore New Courses</h3>
              <p className="text-sm text-gray-600">Discover courses tailored to your interests</p>
            </div>
          </Link>
          <Link 
            to="/skill-assessment"
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Target className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Take Assessment</h3>
              <p className="text-sm text-gray-600">Test your knowledge and earn certificates</p>
            </div>
          </Link>
          <Link 
            to="/study-groups"
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Join Study Groups</h3>
              <p className="text-sm text-gray-600">Connect with peers and learn together</p>
            </div>
          </Link>
        </div>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Your Courses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {inProgressCourses.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={enrollment.course.thumbnail} 
                    alt={enrollment.course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => continueLesson(enrollment.course.id)}
                      aria-label="Continue lesson"
                      className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all"
                    >
                      <PlayCircle className="w-8 h-8 text-blue-600" />
                    </button>
                  </div>
                  <span className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {enrollment.course.category}
                  </span>
                  <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    {enrollment.progress}% Complete
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{enrollment.course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">by {enrollment.course.instructor}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{enrollment.progress}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{width: `${enrollment.progress}%`}}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{enrollment.completedLessons.length}/{enrollment.course.totalLessons} lessons</span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{enrollment.course.duration}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => continueLesson(enrollment.course.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continue Learning
                    </button>
                    <Link 
                      to={`/course/${enrollment.course.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed Courses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedCourses.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={enrollment.course.thumbnail} 
                    alt={enrollment.course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute top-4 left-4 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                    {enrollment.course.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{enrollment.course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">by {enrollment.course.instructor}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">100%</p>
                        <p className="text-xs text-gray-600">Complete</p>
                      </div>
                      {enrollment.certificateEarned && (
                        <div className="text-center">
                          <Award className="w-6 h-6 text-yellow-500 mx-auto" />
                          <p className="text-xs text-gray-600">Certified</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Completed {new Date(enrollment.lastAccessedDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Link 
                      to={`/course/${enrollment.course.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
                    >
                      Review Course
                    </Link>
                    {enrollment.certificateEarned && (
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Enrolled Courses */}
      {totalEnrolledCourses === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
          <p className="text-gray-600 mb-6">Start your learning journey by exploring our course catalog</p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/explore-courses"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Explore Courses
            </Link>
            <Link 
              to="/skill-assessment"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Take Assessment
            </Link>
          </div>
        </div>
      )}

      {/* Recent Assessment Results */}
      {userAssessments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Assessment Results</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userAssessments.slice(0, 5).map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${assessment.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                            {assessment.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {assessment.correctAnswers}/{assessment.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          assessment.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          assessment.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assessment.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(assessment.completedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinueLearning;