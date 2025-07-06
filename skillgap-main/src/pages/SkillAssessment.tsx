import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Clock, Award, TrendingUp, CheckCircle, AlertCircle, BookOpen, BarChart3, Play } from 'lucide-react';
import { User, userStorage } from '../utils/userStorage';

interface SkillAssessmentProps {
  user: User;
}

const SkillAssessment: React.FC<SkillAssessmentProps> = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Get user-specific data
  const userAssessments = userStorage.getUserAssessmentResults(user.id);
  const userCertificates = userStorage.getUserCertificates(user.id);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'programming', name: 'Programming' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'security', name: 'Cybersecurity' },
    { id: 'design', name: 'Design' },
    { id: 'project-management', name: 'Project Management' }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const assessments = [
    {
      id: '1',
      title: 'JavaScript Fundamentals Assessment',
      category: 'programming',
      level: 'beginner',
      duration: '30 min',
      questions: 25,
      difficulty: 'Easy',
      participants: 15420,
      averageScore: 78,
      description: 'Test your understanding of JavaScript basics including variables, functions, and ES6 features',
      skills: ['Variables & Data Types', 'Functions', 'DOM Manipulation', 'ES6 Features'],
      badge: 'JavaScript Foundation',
      icon: '🟨'
    },
    {
      id: '2',
      title: 'React Advanced Patterns',
      category: 'programming',
      level: 'advanced',
      duration: '45 min',
      questions: 35,
      difficulty: 'Hard',
      participants: 8760,
      averageScore: 65,
      description: 'Advanced React concepts including hooks, context, performance optimization, and design patterns',
      skills: ['Custom Hooks', 'Context API', 'Performance Optimization', 'Design Patterns'],
      badge: 'React Expert',
      icon: '⚛️'
    },
    {
      id: '3',
      title: 'Data Science Fundamentals',
      category: 'data-science',
      level: 'intermediate',
      duration: '60 min',
      questions: 40,
      difficulty: 'Medium',
      participants: 12340,
      averageScore: 72,
      description: 'Assess your knowledge of statistics, data analysis, and machine learning basics',
      skills: ['Statistics', 'Python/Pandas', 'Machine Learning', 'Data Visualization'],
      badge: 'Data Analyst',
      icon: '📊'
    },
    {
      id: '4',
      title: 'AWS Cloud Practitioner',
      category: 'cloud',
      level: 'beginner',
      duration: '90 min',
      questions: 65,
      difficulty: 'Medium',
      participants: 23100,
      averageScore: 69,
      description: 'Test your understanding of AWS cloud services, pricing, and best practices',
      skills: ['AWS Services', 'Cloud Security', 'Pricing Models', 'Best Practices'],
      badge: 'Cloud Foundation',
      icon: '☁️'
    },
    {
      id: '5',
      title: 'Cybersecurity Risk Assessment',
      category: 'security',
      level: 'advanced',
      duration: '75 min',
      questions: 50,
      difficulty: 'Hard',
      participants: 5890,
      averageScore: 58,
      description: 'Advanced cybersecurity assessment covering threat detection, incident response, and risk management',
      skills: ['Threat Analysis', 'Risk Management', 'Incident Response', 'Security Frameworks'],
      badge: 'Security Specialist',
      icon: '🔒'
    },
    {
      id: '6',
      title: 'UI/UX Design Principles',
      category: 'design',
      level: 'intermediate',
      duration: '40 min',
      questions: 30,
      difficulty: 'Medium',
      participants: 9680,
      averageScore: 74,
      description: 'Evaluate your understanding of design principles, user research, and prototyping',
      skills: ['Design Thinking', 'User Research', 'Prototyping', 'Visual Design'],
      badge: 'UX Designer',
      icon: '🎨'
    }
  ];

  const skillGaps = [
    {
      skill: 'Machine Learning',
      currentLevel: 2,
      requiredLevel: 4,
      gap: 2,
      priority: 'high',
      recommendedCourses: 3,
      lastAssessed: '2024-01-15'
    },
    {
      skill: 'AWS Architecture',
      currentLevel: 3,
      requiredLevel: 4,
      gap: 1,
      priority: 'medium',
      recommendedCourses: 2,
      lastAssessed: '2024-01-12'
    },
    {
      skill: 'React Performance',
      currentLevel: 4,
      requiredLevel: 5,
      gap: 1,
      priority: 'medium',
      recommendedCourses: 2,
      lastAssessed: '2024-01-10'
    },
    {
      skill: 'Database Design',
      currentLevel: 4,
      requiredLevel: 4,
      gap: 0,
      priority: 'low',
      recommendedCourses: 1,
      lastAssessed: '2024-01-08'
    }
  ];

  const filteredAssessments = assessments.filter(assessment => {
    const matchesCategory = selectedCategory === 'all' || assessment.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || assessment.level === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  // Calculate user stats
  const passedAssessments = userAssessments.filter(a => a.status === 'passed').length;
  const averageScore = userAssessments.length > 0 
    ? Math.round(userAssessments.reduce((acc, result) => acc + result.score, 0) / userAssessments.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Assessment</h1>
        <p className="text-gray-600">Test your knowledge and identify skill gaps to accelerate your career growth</p>
      </div>

      {/* Assessment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Assessments Taken</p>
              <p className="text-3xl font-bold">{userAssessments.length}</p>
            </div>
            <Target className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Average Score</p>
              <p className="text-3xl font-bold">{averageScore}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Badges Earned</p>
              <p className="text-3xl font-bold">{userCertificates.length}</p>
            </div>
            <Award className="w-10 h-10 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Skill Gaps</p>
              <p className="text-3xl font-bold">
                {skillGaps.filter(gap => gap.gap > 0).length}
              </p>
            </div>
            <BarChart3 className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Skill Gap Analysis</h2>
        <div className="space-y-4">
          {skillGaps.map((skill, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{skill.skill}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    skill.priority === 'high' ? 'bg-red-100 text-red-800' :
                    skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {skill.priority} priority
                  </span>
                  <span className="text-xs text-gray-500">
                    Last assessed: {new Date(skill.lastAssessed).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Current Level</span>
                    <span>{skill.currentLevel}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{width: `${(skill.currentLevel / 5) * 100}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Required Level</span>
                    <span>{skill.requiredLevel}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{width: `${(skill.requiredLevel / 5) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {skill.gap > 0 ? (
                  <span className="text-sm text-red-600 font-medium">
                    Gap: {skill.gap} level{skill.gap > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Skill requirement met
                  </span>
                )}
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  {skill.recommendedCourses} recommended courses →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-gray-700">Filter Assessments:</span>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {levels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-600">
            {filteredAssessments.length} assessments available
          </div>
        </div>
      </div>

      {/* Available Assessments */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Assessments</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssessments.map((assessment) => (
            <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{assessment.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                    <p className="text-sm text-gray-600">{assessment.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  assessment.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  assessment.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {assessment.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{assessment.duration}</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  <span>{assessment.questions} questions</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span>{assessment.averageScore}% avg</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Skills covered:</p>
                <div className="flex flex-wrap gap-1">
                  {assessment.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="w-4 h-4 mr-1" />
                  <span>Earn "{assessment.badge}" badge</span>
                </div>
                <span className="text-sm text-gray-600">
                  {assessment.participants.toLocaleString()} participants
                </span>
              </div>

              <Link 
                to={`/assessment/${assessment.id}`}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Assessment</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assessment Results */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Assessment Results</h2>
        {userAssessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments taken yet</h3>
            <p className="text-gray-600 mb-4">Start your first assessment to track your progress and earn certificates</p>
            <Link 
              to={`/assessment/${assessments[0].id}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Take Your First Assessment
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userAssessments.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{result.title}</div>
                        <div className="text-xs text-gray-500">
                          {result.correctAnswers}/{result.totalQuestions} correct
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className={`text-lg font-bold ${result.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {result.status === 'passed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                          )}
                          <span className={`text-sm font-medium ${
                            result.status === 'passed' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {result.timeSpent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {result.percentile}th percentile
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(result.completedDate).toLocaleDateString()}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillAssessment;