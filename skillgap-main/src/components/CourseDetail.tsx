import  React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Users, Star, BookOpen, CheckCircle, Lock, Download, MessageCircle, Share2, Award, ArrowLeft, ArrowRight, FileText, Video, Code, Pizza as Quiz, X } from 'lucide-react';
import { courseStorage, Course, CourseEnrollment, Lesson } from '../utils/courseStorage';
import { User, userStorage } from '../utils/userStorage';
import { emailService } from '../utils/emailService';

interface CourseDetailProps {
  user: User;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    if (id) {
      const foundCourse = courseStorage.getCourseById(id);
      setCourse(foundCourse);
      
      if (foundCourse) {
        const userEnrollment = courseStorage.getUserEnrollment(user.id, id);
        setEnrollment(userEnrollment);
      }
    }
  }, [id, user.id]);

  const handleEnroll = () => {
    if (course && !enrollment) {
      const newEnrollment = courseStorage.enrollUserInCourse(user.id, course.id);
      setEnrollment(newEnrollment);
      
      // Save activity
      const activity = {
        id: Date.now().toString(),
        userId: user.id,
        type: 'course_enrolled' as const,
        title: `Enrolled in ${course.title}`,
        timestamp: new Date().toISOString(),
        data: { courseId: course.id }
      };
      userStorage.saveActivity(activity);

      // Send enrollment email
      emailService.sendCourseEnrollmentEmail(user, course);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (enrollment) {
      setCurrentLesson(lesson);
      if (lesson.type === 'video' && lesson.videoUrl) {
        setShowVideoPlayer(true);
      }
    }
  };

  const markLessonComplete = (lessonId: string) => {
    if (course && enrollment) {
      courseStorage.updateEnrollmentProgress(user.id, course.id, lessonId);
      
      // Update local enrollment state
      const updatedEnrollment = courseStorage.getUserEnrollment(user.id, course.id);
      setEnrollment(updatedEnrollment);

      // Save lesson progress
      const progress = {
        id: Date.now().toString(),
        userId: user.id,
        courseId: course.id,
        lessonId,
        completed: true,
        completedDate: new Date().toISOString(),
        timeSpent: 0
      };
      courseStorage.saveLessonProgress(progress);

      // Check if course is completed
      if (updatedEnrollment && updatedEnrollment.progress === 100) {
        handleCourseCompletion(updatedEnrollment);
      }
    }
  };

  const handleCourseCompletion = (completedEnrollment: CourseEnrollment) => {
    if (!course) return;

    // Mark certificate as earned
    courseStorage.markCertificateEarned(user.id, course.id);

    // Generate certificate
    const certificate = {
      id: `CERT-${course.id}-${Date.now()}`,
      userId: user.id,
      courseId: course.id,
      title: course.title,
      badge: `${course.title} Completion Certificate`,
      score: 100,
      completedDate: new Date().toISOString(),
      certificateId: `CERT-${course.id}-${Date.now()}`
    };

    // Save certificate
    userStorage.saveCertificate(certificate);

    // Save completion activity
    const activity = {
      id: Date.now().toString(),
      userId: user.id,
      type: 'course_completed' as const,
      title: `Completed ${course.title}`,
      timestamp: new Date().toISOString(),
      data: { 
        courseId: course.id,
        certificateId: certificate.id,
        progress: 100
      }
    };
    userStorage.saveActivity(activity);

    // Send completion email with certificate
    emailService.sendCourseCompletionEmail(user, course, certificate);

    // Show completion modal
    alert(`Congratulations! You've completed ${course.title}. Your certificate has been generated and emailed to you!`);
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const getYouTubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'reading':
        return <FileText className="w-4 h-4" />;
      case 'interactive':
        return <Code className="w-4 h-4" />;
      case 'quiz':
        return <Quiz className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.completedLessons.includes(lessonId) || false;
  };

  const canAccessLesson = (moduleIndex: number, lessonIndex: number) => {
    if (!enrollment) return false;
    if (moduleIndex === 0 && lessonIndex === 0) return true;
    
    // Check if previous lesson is completed
    if (lessonIndex > 0) {
      const prevLesson = course?.syllabus[moduleIndex].lessons[lessonIndex - 1];
      return prevLesson ? isLessonCompleted(prevLesson.id) : false;
    } else if (moduleIndex > 0) {
      const prevModule = course?.syllabus[moduleIndex - 1];
      const lastLesson = prevModule?.lessons[prevModule.lessons.length - 1];
      return lastLesson ? isLessonCompleted(lastLesson.id) : false;
    }
    
    return false;
  };

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
          <button 
            onClick={() => navigate('/explore-courses')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          <div>
            <button 
              onClick={() => navigate('/explore-courses')}
              className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </button>
            
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                {course.category}
              </span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {course.level}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-6">{course.description}</p>
            
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{course.rating}</span>
                <span className="text-gray-600">({course.students.toLocaleString()} students)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{course.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{course.totalLessons} lessons</span>
              </div>
            </div>

            {enrollment && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Your Progress</span>
                  <span>{enrollment.progress}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${enrollment.progress}%`}}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {!enrollment ? (
                <button
                  onClick={handleEnroll}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Enroll Now - ${course.price}
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTab('curriculum')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Continue Learning</span>
                </button>
              )}
              <button   aria-label="Close video player"className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
              <button 
                onClick={() => {
                  if (enrollment && course.syllabus[0]?.lessons[0]) {
                    handleLessonClick(course.syllabus[0].lessons[0]);
                  }
                }}
                className={`bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all ${
                  !enrollment ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!enrollment}
              >
                <Play className="w-8 h-8 text-blue-600" />
              </button>
            </div>
            {!enrollment && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Enroll to Access
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
                    <ul className="space-y-2">
                      {course.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills You'll Gain</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-6">
                  {course.syllabus.map((module, moduleIndex) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">
                          Module {moduleIndex + 1}: {module.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>
                      <div className="p-4 space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isCompleted = isLessonCompleted(lesson.id);
                          const canAccess = canAccessLesson(moduleIndex, lessonIndex);
                          
                          return (
                            <div key={lesson.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : canAccess ? (
                                  <button
                                    onClick={() => handleLessonClick(lesson)}
                                    className="w-5 h-5 text-blue-500 hover:text-blue-700"
                                  >
                                    {getLessonIcon(lesson.type)}
                                  </button>
                                ) : (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                )}
                                <button
                                  onClick={() => canAccess && handleLessonClick(lesson)}
                                  className={`text-left ${
                                    isCompleted ? 'text-gray-500 line-through' : 
                                    canAccess ? 'text-gray-900 hover:text-blue-600' : 
                                    'text-gray-400'
                                  }`}
                                  disabled={!canAccess}
                                >
                                  {lesson.title}
                                </button>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  lesson.type === 'video' ? 'bg-blue-100 text-blue-800' :
                                  lesson.type === 'reading' ? 'bg-green-100 text-green-800' :
                                  lesson.type === 'interactive' ? 'bg-purple-100 text-purple-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {lesson.type}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">{lesson.duration}</span>
                                {canAccess && !isCompleted && (
                                  <button
                                    onClick={() => markLessonComplete(lesson.id)}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                  >
                                    Mark Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {module.quiz && (
                          <div className="border-t pt-3 mt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Quiz className="w-5 h-5 text-orange-500" />
                                <span className="text-gray-900">{module.quiz.title}</span>
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  Quiz
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {module.quiz.questions.length} questions
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={course.instructorAvatar}
                      alt={course.instructor}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{course.instructor}</h3>
                      <p className="text-gray-600 mt-2">{course.instructorBio}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{course.students.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{course.rating}</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">5+</div>
                      <div className="text-sm text-gray-600">Courses</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Student Reviews</h3>
                    {enrollment && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Write Review
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">Student {i}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className={`w-4 h-4 ${
                                    j < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-gray-700">
                          Great course! The instructor explains concepts clearly and the hands-on projects are very helpful.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Progress (if enrolled) */}
          {enrollment && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{enrollment.progress}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{width: `${enrollment.progress}%`}}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 text-center">
                  {enrollment.completedLessons.length} of {course.totalLessons} lessons completed
                </div>
                {enrollment.progress === 100 && (
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>View Certificate</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Course Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Level</span>
                <span className="font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lessons</span>
                <span className="font-medium">{course.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Students</span>
                <span className="font-medium">{course.students.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Language</span>
                <span className="font-medium">English</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certificate</span>
                <span className="font-medium">Yes</span>
              </div>
            </div>
          </div>

          {/* Course Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Course Includes</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">HD video lectures</span>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Downloadable resources</span>
              </div>
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">Hands-on projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">Q&A support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700">Certificate of completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Video Player Modal */}
      {showVideoPlayer && currentLesson && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50"
            onClick={() => setShowVideoPlayer(false)}
          />
          <div className="fixed inset-4 bg-white rounded-xl z-50 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{currentLesson.title}</h2>
                <button
                 aria-label="Close video player"
                  onClick={() => setShowVideoPlayer(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-black">
                {currentLesson.videoUrl && getYouTubeVideoId(currentLesson.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(getYouTubeVideoId(currentLesson.videoUrl)!)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-xl mb-2">Video content for: {currentLesson.title}</p>
                      <p className="text-sm opacity-75">Duration: {currentLesson.duration}</p>
                      {currentLesson.videoUrl ? (
                        <div className="mt-4">
                          <p className="text-sm opacity-50 mb-2">YouTube URL: {currentLesson.videoUrl}</p>
                          <p className="text-xs opacity-50">Unable to load video. Please check the URL format.</p>
                        </div>
                      ) : (
                        <p className="text-xs opacity-50 mt-2">No video URL provided</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{currentLesson.title}</h3>
                    <p className="text-sm text-gray-600">{currentLesson.content}</p>
                  </div>
                  <button
                    onClick={() => {
                      markLessonComplete(currentLesson.id);
                      setShowVideoPlayer(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Complete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDetail;