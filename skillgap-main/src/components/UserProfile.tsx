import React, { useState } from 'react';
import { User, Edit3, Camera, Award, BookOpen, Target, TrendingUp, Calendar, Mail, Phone, MapPin, Briefcase, Download, Eye, Star } from 'lucide-react';
import { User as UserType, userStorage } from '../utils/userStorage';

interface UserProfileProps {
  user: UserType;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get user-specific data from storage
  const assessmentResults = userStorage.getUserAssessmentResults(user.id);
  const certificates = userStorage.getUserCertificates(user.id);
  const activities = userStorage.getUserActivities(user.id);

  // Calculate learning stats
  const learningStats = {
    totalCourses: activities.filter(a => a.type === 'course_completed').length + 6, // Add some base courses
    completedCourses: activities.filter(a => a.type === 'course_completed').length,
    inProgressCourses: 3,
    totalHours: 156,
    averageScore: assessmentResults.length > 0 
      ? Math.round(assessmentResults.reduce((acc, result) => acc + result.score, 0) / assessmentResults.length)
      : 0,
    streak: 15,
    totalAssessments: assessmentResults.length,
    passedAssessments: assessmentResults.filter(r => r.status === 'passed').length,
    certificatesEarned: certificates.length
  };

  const recentAchievements = [
    ...certificates.slice(0, 2).map(cert => ({
      id: cert.id,
      title: cert.badge,
      description: `Completed ${cert.title}`,
      date: cert.completedDate,
      icon: '🏆',
      type: 'certificate'
    })),
    {
      id: 'streak',
      title: 'Learning Streak',
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

  const skillProgress = [
    { skill: 'JavaScript', level: 'Expert', progress: 95, lastAssessed: '2024-01-18' },
    { skill: 'React', level: 'Advanced', progress: 88, lastAssessed: '2024-01-10' },
    { skill: 'Python', level: 'Intermediate', progress: 72, lastAssessed: '2024-01-15' },
    { skill: 'AWS', level: 'Beginner', progress: 45, lastAssessed: '2024-01-12' },
    { skill: 'Node.js', level: 'Intermediate', progress: 68, lastAssessed: '2024-01-08' },
    { skill: 'Docker', level: 'Beginner', progress: 35, lastAssessed: '2024-01-05' }
  ];

  const generateCertificate = (result: any) => {
    // This would typically generate a PDF certificate
    const certificateData = {
      recipientName: user.name,
      assessmentTitle: result.title,
      score: result.score,
      completionDate: result.completedDate,
      certificateId: result.certificateId,
      badge: result.badge
    };
    
    // Simulate certificate download
    console.log('Generating certificate:', certificateData);
    alert(`Certificate for ${result.title} is being generated and will be downloaded shortly.`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assessments', label: 'Assessment Results' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'skills', label: 'Skills Progress' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="relative px-6 pb-6">
          <div className="flex items-end space-x-6 -mt-16">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.role} • {user.department}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{certificates.length} Certificates</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">{learningStats.passedAssessments}/{learningStats.totalAssessments} Assessments Passed</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Save' : 'Edit Profile'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Assessments Passed</p>
              <p className="text-3xl font-bold">{learningStats.passedAssessments}</p>
              <p className="text-blue-100 text-sm">of {learningStats.totalAssessments} taken</p>
            </div>
            <Target className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Certificates Earned</p>
              <p className="text-3xl font-bold">{certificates.length}</p>
              <p className="text-green-100 text-sm">Verified credentials</p>
            </div>
            <Award className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Average Score</p>
              <p className="text-3xl font-bold">{learningStats.averageScore}%</p>
              <p className="text-purple-100 text-sm">
                {learningStats.averageScore >= 80 ? 'Excellent!' : learningStats.averageScore >= 70 ? 'Good work!' : 'Keep improving!'}
              </p>
            </div>
            <Star className="w-10 h-10 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Learning Hours</p>
              <p className="text-3xl font-bold">{learningStats.totalHours}h</p>
              <p className="text-orange-100 text-sm">Total time invested</p>
            </div>
            <BookOpen className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{user.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium">{user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Bio</p>
                  <p className="text-gray-800">{user.bio || 'No bio provided'}</p>
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
                <div className="space-y-4">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Assessment Results History</h2>
              {assessmentResults.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments taken yet</h3>
                  <p className="text-gray-600">Start taking assessments to track your progress</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {assessmentResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{result.title}</div>
                              <div className="text-xs text-gray-500">
                                {result.correctAnswers}/{result.totalQuestions} correct • {result.difficulty}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-lg font-bold ${result.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.score}%
                              </span>
                              <span className="text-xs text-gray-500 ml-2">({result.percentile}th percentile)</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              result.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {result.timeSpent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {result.badge ? (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                {result.badge}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">No badge</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(result.completedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-700 text-sm">
                                View Details
                              </button>
                              {result.certificateId && (
                                <button 
                                  onClick={() => generateCertificate(result)}
                                  className="text-green-600 hover:text-green-700 text-sm"
                                >
                                  Certificate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Earned Certificates</h2>
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                  <p className="text-gray-600">Complete assessments to earn certificates</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2">{cert.badge}</h3>
                      <p className="text-sm text-gray-600 mb-3">{cert.title}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Score:</span>
                          <span className="font-medium text-green-600">{cert.score}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Certificate ID:</span>
                          <span className="font-mono text-xs">{cert.certificateId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Issued:</span>
                          <span>{new Date(cert.completedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => generateCertificate(cert)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Skills Progress</h2>
              <div className="space-y-6">
                {skillProgress.map((skill, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                        <p className="text-sm text-gray-600">Level: {skill.level}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{skill.progress}%</div>
                        <div className="text-xs text-gray-500">Last assessed: {new Date(skill.lastAssessed).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          skill.progress >= 80 ? 'bg-green-500' :
                          skill.progress >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{width: `${skill.progress}%`}}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-sm font-medium ${
                        skill.progress >= 80 ? 'text-green-600' :
                        skill.progress >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {skill.progress >= 80 ? 'Expert' :
                         skill.progress >= 60 ? 'Proficient' :
                         'Needs Improvement'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Take Assessment →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;