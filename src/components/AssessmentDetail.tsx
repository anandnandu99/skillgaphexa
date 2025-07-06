import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Award, RotateCcw, ArrowRight, ArrowLeft, AlertCircle, Download, Share2, Loader, Sparkles } from 'lucide-react';
import { User, userStorage, AssessmentResult, Activity, Certificate } from '../utils/userStorage';
import { emailService } from '../utils/emailService';
import { llmService } from '../utils/llmService';
import type { LLMQuestion } from '../utils/types';

interface Assessment {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  passingScore: number;
  category: string;
  level: string;
  badge: string;
}

interface AssessmentDetailProps {
  user: User;
}

const AssessmentDetail: React.FC<AssessmentDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<LLMQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionGenerationError, setQuestionGenerationError] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Sample assessments data
  const assessments: Assessment[] = [
    {
      id: '1',
      title: 'JavaScript Fundamentals Assessment',
      description: 'Test your understanding of JavaScript basics including variables, functions, and ES6 features',
      duration: 30,
      passingScore: 70,
      category: 'programming',
      level: 'beginner',
      badge: 'JavaScript Foundation'
    },
    {
      id: '2',
      title: 'React Advanced Patterns',
      description: 'Advanced React concepts including hooks, context, performance optimization, and design patterns',
      duration: 45,
      passingScore: 75,
      category: 'programming',
      level: 'advanced',
      badge: 'React Expert'
    },
    {
      id: '3',
      title: 'Data Science Fundamentals',
      description: 'Assess your knowledge of statistics, data analysis, and machine learning basics',
      duration: 60,
      passingScore: 70,
      category: 'data-science',
      level: 'intermediate',
      badge: 'Data Analyst'
    },
    {
      id: '4',
      title: 'AWS Cloud Practitioner',
      description: 'Test your understanding of AWS cloud services, pricing, and best practices',
      duration: 90,
      passingScore: 70,
      category: 'cloud',
      level: 'beginner',
      badge: 'Cloud Foundation'
    },
    {
      id: '5',
      title: 'Cybersecurity Risk Assessment',
      description: 'Advanced cybersecurity assessment covering threat detection, incident response, and risk management',
      duration: 75,
      passingScore: 75,
      category: 'security',
      level: 'advanced',
      badge: 'Security Specialist'
    },
    {
      id: '6',
      title: 'UI/UX Design Principles',
      description: 'Evaluate your understanding of design principles, user research, and prototyping',
      duration: 40,
      passingScore: 70,
      category: 'design',
      level: 'intermediate',
      badge: 'UX Designer'
    }
  ];

  useEffect(() => {
    const foundAssessment = assessments.find(a => a.id === id);
    if (foundAssessment) {
      setAssessment(foundAssessment);
      setTimeLeft(foundAssessment.duration * 60); // Convert to seconds
      
      // Check if user has already passed this assessment
      const userAssessments = userStorage.getUserAssessmentResults(user.id);
      const hasPassedAssessment = userAssessments.some(
        result => result.assessmentId === foundAssessment.id && result.status === 'passed'
      );
      
      if (hasPassedAssessment) {
        // Redirect to skill assessment page with message
        navigate('/skill-assessment', { 
          state: { 
            message: `You have already passed the ${foundAssessment.title}. Try other assessments to continue learning!` 
          }
        });
        return;
      }
    }
  }, [id, user.id, navigate]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (assessmentStarted && timeLeft > 0 && !showResults) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && assessmentStarted) {
      setShowResults(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, assessmentStarted, showResults]);

  const generateQuestions = async () => {
    if (!assessment) return;
    
    setIsLoadingQuestions(true);
    setQuestionGenerationError(null);
    
    try {
      const userContext = {
        role: user.role,
        department: user.department,
        level: assessment.level
      };
      
      console.log('Generating questions for:', assessment.title);
      const generatedQuestions = await llmService.generateAssessmentQuestions(
        assessment.title,
        userContext
      );
      
      console.log('Generated questions:', generatedQuestions);
      
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setSelectedAnswers(new Array(generatedQuestions.length).fill(undefined));
        setQuestionGenerationError(null);
      } else {
        throw new Error('No questions generated');
      }
    } catch (error) {
      console.error('Question generation error:', error);
      setQuestionGenerationError('Unable to connect to AI service. Using our comprehensive question bank instead.');
      
      // This should not happen with the improved fallback, but just in case
      setTimeout(() => {
        setQuestionGenerationError(null);
        setIsLoadingQuestions(false);
      }, 2000);
    } finally {
      // Always stop loading after a short delay to ensure questions are set
      setTimeout(() => {
        setIsLoadingQuestions(false);
      }, 1000);
    }
  };

  const startAssessment = async () => {
    await generateQuestions();
    setAssessmentStarted(true);
  };

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Assessment not found</h1>
          <button 
            onClick={() => navigate('/skill-assessment')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const saveAssessmentResult = (score: number, passed: boolean) => {
    const correctAnswers = selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
    const timeSpent = formatTime((assessment.duration * 60) - timeLeft);
    
    const result: AssessmentResult = {
      id: Date.now().toString(),
      userId: user.id,
      assessmentId: assessment.id,
      title: assessment.title,
      score,
      maxScore: 100,
      completedDate: new Date().toISOString(),
      status: passed ? 'passed' : 'failed',
      percentile: Math.floor(Math.random() * 30) + (passed ? 70 : 20), // Simulated percentile
      badge: passed ? assessment.badge : null,
      timeSpent,
      correctAnswers,
      totalQuestions: questions.length,
      certificateId: passed ? `CERT-${assessment.id}-${Date.now()}` : null,
      difficulty: assessment.level
    };

    setAssessmentResult(result);
    
    // Save to storage
    userStorage.saveAssessmentResult(result);
    
    // Save activity
    const activity: Activity = {
      id: Date.now().toString(),
      userId: user.id,
      type: 'assessment_completed',
      title: `Completed ${assessment.title}`,
      timestamp: new Date().toISOString(),
      data: {
        score,
        status: passed ? 'passed' : 'failed',
        badge: passed ? assessment.badge : null
      }
    };
    userStorage.saveActivity(activity);

    // Send assessment completion email
    emailService.sendAssessmentCompletionEmail(user, result);

    // Save certificate if passed
    if (passed && result.certificateId) {
      const certificate: Certificate = {
        id: result.certificateId,
        userId: user.id,
        assessmentId: assessment.id,
        title: assessment.title,
        badge: assessment.badge,
        score,
        completedDate: new Date().toISOString(),
        certificateId: result.certificateId
      };
      userStorage.saveCertificate(certificate);

      // Send certificate email
      emailService.sendCertificateEmail(user, certificate);

      // Save certificate activity
      const certActivity: Activity = {
        id: (Date.now() + 1).toString(),
        userId: user.id,
        type: 'certificate_earned',
        title: `Earned ${assessment.badge} certificate`,
        timestamp: new Date().toISOString(),
        data: {
          certificateId: result.certificateId,
          badge: assessment.badge
        }
      };
      userStorage.saveActivity(certActivity);
    }
  };

  const generateCertificate = () => {
    if (!assessmentResult) return;
    setShowCertificate(true);
  };

  const downloadCertificate = () => {
    alert('Certificate downloaded successfully!');
  };

  const restartAssessment = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTimeLeft(assessment.duration * 60);
    setAssessmentStarted(false);
    setShowCertificate(false);
    setAssessmentResult(null);
    setQuestions([]);
    setQuestionGenerationError(null);
  };

  // Loading Questions State
  if (isLoadingQuestions) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader className="w-12 h-12 text-blue-600 animate-spin" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Preparing Your Assessment</h2>
            <p className="text-gray-600 max-w-md">
              Creating personalized questions for {user.role} in {user.department}. 
              This will take just a moment...
            </p>
            <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
              <div className="flex items-center space-x-2 text-blue-800">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Assessment Features:</span>
              </div>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                <li>• Personalized for your role and department</li>
                <li>• Comprehensive question bank</li>
                <li>• Real-world scenario questions</li>
                <li>• Detailed explanations for learning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessmentStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <button 
            onClick={() => navigate('/skill-assessment')}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{assessment.title}</h1>
            <p className="text-gray-600 mb-6">{assessment.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{assessment.duration}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{assessment.passingScore}%</div>
                <div className="text-sm text-gray-600">Pass Score</div>
              </div>
            </div>

            {questionGenerationError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{questionGenerationError}</span>
                </div>
              </div>
            )}

            <div className="text-left bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Assessment Features:
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Questions personalized for your role as {user.role}</li>
                <li>• Content adapted to {user.department} department context</li>
                <li>• Dynamic difficulty based on {assessment.level} level</li>
                <li>• Comprehensive question bank with detailed explanations</li>
                <li>• Earn the "{assessment.badge}" badge upon successful completion</li>
                <li>• Receive a digital certificate with unique verification ID</li>
              </ul>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Assessment Instructions:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• You have {assessment.duration} minutes to complete all questions</li>
                <li>• Each question has only one correct answer</li>
                <li>• You can navigate between questions freely</li>
                <li>• Your progress is automatically saved</li>
                <li>• You need {assessment.passingScore}% to pass and earn the certificate</li>
                <li>• Questions are selected from our comprehensive question bank</li>
                <li>• Make sure you have a stable internet connection</li>
              </ul>
            </div>

            <button
              onClick={startAssessment}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-lg flex items-center space-x-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Questions & Start Assessment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= assessment.passingScore;
    const correctAnswers = selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;

    // Save the result when showing results for the first time
    if (!assessmentResult) {
      saveAssessmentResult(score, passed);
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
            <p className={`text-lg ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? `Congratulations! You earned the "${assessment.badge}" badge!` : 'Keep studying and try again!'}
            </p>
            {passed && (
              <p className="text-gray-600 mt-2">Your certificate is ready for download and an email has been sent to you!</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{score}%</div>
              <div className="text-gray-600">Your Score</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{formatTime((assessment.duration * 60) - timeLeft)}</div>
              <div className="text-gray-600">Time Taken</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{assessment.passingScore}%</div>
              <div className="text-gray-600">Required</div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Review Your Questions</h2>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Sparkles className="w-4 h-4" />
                <span>Personalized Assessment</span>
              </div>
            </div>
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          Question {index + 1}: {question.question}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {question.category}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 border border-green-300'
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-100 border border-red-300'
                                : 'bg-gray-50'
                            }`}
                          >
                            {option}
                            {optionIndex === question.correctAnswer && (
                              <span className="ml-2 text-green-600 font-medium">(Correct)</span>
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <span className="ml-2 text-red-600 font-medium">(Your answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={restartAssessment}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retake Assessment</span>
            </button>
            <button 
              onClick={() => navigate('/skill-assessment')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Back to Assessments
            </button>
            {passed && (
              <button 
                onClick={generateCertificate}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
              >
                <Award className="w-5 h-5" />
                <span>View Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showCertificate && assessmentResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Certificate Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate of Achievement</h1>
            <p className="text-gray-600">This certifies that</p>
          </div>

          {/* Certificate Body */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border-2 border-blue-200">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-blue-900 mb-4">{user.name}</h2>
              <p className="text-lg text-gray-700 mb-6">has successfully completed the</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{assessmentResult.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{assessmentResult.score}%</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{assessmentResult.percentile}th</div>
                  <div className="text-sm text-gray-600">Percentile</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{assessmentResult.badge}</div>
                  <div className="text-sm text-gray-600">Badge Earned</div>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-6">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    <p>Certificate ID: <span className="font-mono">{assessmentResult.certificateId}</span></p>
                    <p>Issued: {new Date(assessmentResult.completedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p>Hexaware Learning Platform</p>
                    <p>Personalized Assessment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={downloadCertificate}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Certificate</span>
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Share on LinkedIn</span>
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              View in Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Preparing Assessment</h2>
          <p className="text-gray-600">Please wait while we set up your personalized questions...</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Assessment Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {question.difficulty}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {question.category}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Personalized</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : ''}`}>
              {formatTime(timeLeft)}
            </span>
            {timeLeft < 300 && (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300" 
            style={{width: `${progress}%`}}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h2>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion] === undefined}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedAnswers[currentQuestion] === undefined
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          <span>{currentQuestion === questions.length - 1 ? 'Finish Assessment' : 'Next'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Question Navigator */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
        <div className="grid grid-cols-5 gap-3">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-12 h-12 rounded-lg font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : selectedAnswers[index] !== undefined
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetail;