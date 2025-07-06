import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit3, Play, Youtube, BookOpen, Clock, Users, X, Check, AlertCircle } from 'lucide-react';
import { courseStorage, Course, CourseModule, Lesson } from '../utils/courseStorage';

interface CourseManagerProps {
  onClose?: () => void;
}

const CourseManager: React.FC<CourseManagerProps> = ({ onClose }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    instructorBio: '',
    category: 'development',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    price: 0,
    thumbnail: '',
    tags: '',
    learningObjectives: '',
    prerequisites: ''
  });

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    lessons: [] as Lesson[]
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'video' as 'video' | 'reading' | 'interactive' | 'quiz',
    duration: '',
    content: '',
    videoUrl: ''
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    const allCourses = courseStorage.getAllCourses();
    setCourses(allCourses);
  };

  const handleSaveCourse = async () => {
    setSaveStatus('saving');
    try {
      if (selectedCourse) {
        courseStorage.saveCourse(selectedCourse);
        loadCourses();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleCreateCourse = () => {
    const course: Course = {
      id: Date.now().toString(),
      title: newCourse.title,
      description: newCourse.description,
      instructor: newCourse.instructor,
      instructorBio: newCourse.instructorBio,
      instructorAvatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150',
      category: newCourse.category,
      level: newCourse.level,
      duration: newCourse.duration,
      totalLessons: 0,
      price: newCourse.price,
      rating: 4.5,
      students: 0,
      thumbnail: newCourse.thumbnail || 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: newCourse.tags.split(',').map(tag => tag.trim()),
      learningObjectives: newCourse.learningObjectives.split('\n').filter(obj => obj.trim()),
      prerequisites: newCourse.prerequisites.split('\n').filter(req => req.trim()),
      syllabus: [],
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    courseStorage.saveCourse(course);
    loadCourses();
    setShowNewCourseForm(false);
    setNewCourse({
      title: '', description: '', instructor: '', instructorBio: '', category: 'development',
      level: 'beginner', duration: '', price: 0, thumbnail: '', tags: '', learningObjectives: '', prerequisites: ''
    });
  };

  const handleAddModule = () => {
    if (selectedCourse && newModule.title) {
      const module: CourseModule = {
        id: Date.now().toString(),
        title: newModule.title,
        description: newModule.description,
        lessons: []
      };

      const updatedCourse = {
        ...selectedCourse,
        syllabus: [...selectedCourse.syllabus, module],
        lastUpdated: new Date().toISOString()
      };

      setSelectedCourse(updatedCourse);
      setNewModule({ title: '', description: '', lessons: [] });
    }
  };

  const handleAddLesson = (moduleId: string) => {
    if (selectedCourse && newLesson.title) {
      const lesson: Lesson = {
        id: Date.now().toString(),
        title: newLesson.title,
        type: newLesson.type,
        duration: newLesson.duration,
        content: newLesson.content,
        videoUrl: newLesson.videoUrl,
        completed: false
      };

      const updatedCourse = {
        ...selectedCourse,
        syllabus: selectedCourse.syllabus.map(module =>
          module.id === moduleId
            ? { ...module, lessons: [...module.lessons, lesson] }
            : module
        ),
        totalLessons: selectedCourse.totalLessons + 1,
        lastUpdated: new Date().toISOString()
      };

      setSelectedCourse(updatedCourse);
      setNewLesson({ title: '', type: 'video', duration: '', content: '', videoUrl: '' });
    }
  };

  const handleUpdateLesson = (moduleId: string, lessonId: string, updatedLesson: Partial<Lesson>) => {
    if (selectedCourse) {
      const updatedCourse = {
        ...selectedCourse,
        syllabus: selectedCourse.syllabus.map(module =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.map(lesson =>
                  lesson.id === lessonId ? { ...lesson, ...updatedLesson } : lesson
                )
              }
            : module
        ),
        lastUpdated: new Date().toISOString()
      };

      setSelectedCourse(updatedCourse);
    }
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (selectedCourse) {
      const updatedCourse = {
        ...selectedCourse,
        syllabus: selectedCourse.syllabus.map(module =>
          module.id === moduleId
            ? { ...module, lessons: module.lessons.filter(lesson => lesson.id !== lessonId) }
            : module
        ),
        totalLessons: selectedCourse.totalLessons - 1,
        lastUpdated: new Date().toISOString()
      };

      setSelectedCourse(updatedCourse);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    if (selectedCourse) {
      const moduleToDelete = selectedCourse.syllabus.find(m => m.id === moduleId);
      const lessonsToDelete = moduleToDelete ? moduleToDelete.lessons.length : 0;

      const updatedCourse = {
        ...selectedCourse,
        syllabus: selectedCourse.syllabus.filter(module => module.id !== moduleId),
        totalLessons: selectedCourse.totalLessons - lessonsToDelete,
        lastUpdated: new Date().toISOString()
      };

      setSelectedCourse(updatedCourse);
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const categories = [
    { id: 'development', name: 'Development' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'design', name: 'Design' },
    { id: 'mobile', name: 'Mobile Development' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'security', name: 'Cybersecurity' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Create and manage courses with modules and YouTube videos</p>
        </div>
        <div className="flex items-center space-x-4">
          {selectedCourse && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveCourse}
                disabled={saveStatus === 'saving'}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  saveStatus === 'saved' ? 'bg-green-600 text-white' :
                  saveStatus === 'error' ? 'bg-red-600 text-white' :
                  'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : saveStatus === 'saved' ? (
                  <Check className="w-4 h-4" />
                ) : saveStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {saveStatus === 'saving' ? 'Saving...' :
                   saveStatus === 'saved' ? 'Saved!' :
                   saveStatus === 'error' ? 'Error!' : 'Save Course'}
                </span>
              </button>
            </div>
          )}
          <button
            onClick={() => setShowNewCourseForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Courses</h2>
            <div className="space-y-3">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedCourse?.id === course.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {course.syllabus.length} modules
                    </span>
                    <span className="flex items-center">
                      <Play className="w-3 h-3 mr-1" />
                      {course.totalLessons} lessons
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Editor */}
        <div className="lg:col-span-2">
          {selectedCourse ? (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={selectedCourse.title}
                      onChange={(e) => setSelectedCourse({...selectedCourse, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Course Title"
                    />
                    <textarea
                      value={selectedCourse.description}
                      onChange={(e) => setSelectedCourse({...selectedCourse, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                      placeholder="Course Description"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Instructor:</span>
                        <span className="ml-2 font-medium">{selectedCourse.instructor}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Level:</span>
                        <span className="ml-2 font-medium">{selectedCourse.level}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium">{selectedCourse.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Lessons:</span>
                        <span className="ml-2 font-medium">{selectedCourse.totalLessons}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modules */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Modules</h3>
                
                {/* Add New Module */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Add New Module</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newModule.title}
                      onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Module Title"
                    />
                    <textarea
                      value={newModule.description}
                      onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                      placeholder="Module Description"
                    />
                    <button
                      onClick={handleAddModule}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Module</span>
                    </button>
                  </div>
                </div>

                {/* Existing Modules */}
                <div className="space-y-6">
                  {selectedCourse.syllabus.map((module, moduleIndex) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Module {moduleIndex + 1}: {module.title}
                          </h4>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Add New Lesson */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h5 className="font-medium text-gray-900 mb-3">Add New Lesson</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={newLesson.title}
                            onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Lesson Title"
                          />
                          <select
                            value={newLesson.type}
                            onChange={(e) => setNewLesson({...newLesson, type: e.target.value as any})}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                          >
                            <option value="video">Video</option>
                            <option value="reading">Reading</option>
                            <option value="interactive">Interactive</option>
                            <option value="quiz">Quiz</option>
                          </select>
                          <input
                            type="text"
                            value={newLesson.duration}
                            onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Duration (e.g., 30 min)"
                          />
                          <input
                            type="url"
                            value={newLesson.videoUrl}
                            onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="YouTube URL"
                          />
                        </div>
                        <textarea
                          value={newLesson.content}
                          onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 mt-3"
                          placeholder="Lesson Content/Description"
                        />
                        <button
                          onClick={() => handleAddLesson(module.id)}
                          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Lesson</span>
                        </button>
                      </div>

                      {/* Existing Lessons */}
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {editingLesson?.id === lesson.id ? (
                                  <div className="space-y-3">
                                    <input
                                      type="text"
                                      value={editingLesson.title}
                                      onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        value={editingLesson.duration}
                                        onChange={(e) => setEditingLesson({...editingLesson, duration: e.target.value})}
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Duration"
                                      />
                                      <input
                                        type="url"
                                        value={editingLesson.videoUrl || ''}
                                        onChange={(e) => setEditingLesson({...editingLesson, videoUrl: e.target.value})}
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="YouTube URL"
                                      />
                                    </div>
                                    <textarea
                                      value={editingLesson.content}
                                      onChange={(e) => setEditingLesson({...editingLesson, content: e.target.value})}
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                                    />
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          handleUpdateLesson(module.id, lesson.id, editingLesson);
                                          setEditingLesson(null);
                                        }}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingLesson(null)}
                                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h5 className="font-medium text-gray-900">
                                        {lessonIndex + 1}. {lesson.title}
                                      </h5>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        lesson.type === 'video' ? 'bg-red-100 text-red-800' :
                                        lesson.type === 'reading' ? 'bg-green-100 text-green-800' :
                                        lesson.type === 'interactive' ? 'bg-purple-100 text-purple-800' :
                                        'bg-orange-100 text-orange-800'
                                      }`}>
                                        {lesson.type}
                                      </span>
                                      <span className="text-xs text-gray-500">{lesson.duration}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{lesson.content}</p>
                                    {lesson.videoUrl && (
                                      <div className="flex items-center space-x-2 text-sm">
                                        <Youtube className="w-4 h-4 text-red-600" />
                                        <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                          {lesson.videoUrl}
                                        </span>
                                        {extractYouTubeId(lesson.videoUrl) && (
                                          <span className="text-green-600 text-xs">✓ Valid</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => setEditingLesson(lesson)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
              <p className="text-gray-600">Choose a course from the list to edit its modules and lessons</p>
            </div>
          )}
        </div>
      </div>

      {/* New Course Modal */}
      {showNewCourseForm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowNewCourseForm(false)} />
          <div className="fixed inset-4 bg-white rounded-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
                <button onClick={() => setShowNewCourseForm(false)}>
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Enter course title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                      placeholder="Course description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                    <input
                      type="text"
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Instructor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Bio</label>
                    <textarea
                      value={newCourse.instructorBio}
                      onChange={(e) => setNewCourse({...newCourse, instructorBio: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                      placeholder="Brief instructor biography"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({...newCourse, level: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., 8 weeks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newCourse.tags}
                      onChange={(e) => setNewCourse({...newCourse, tags: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="React, JavaScript, Web Development"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives (one per line)</label>
                  <textarea
                    value={newCourse.learningObjectives}
                    onChange={(e) => setNewCourse({...newCourse, learningObjectives: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                    placeholder="Understand React fundamentals&#10;Build interactive web applications&#10;Master component lifecycle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites (one per line)</label>
                  <textarea
                    value={newCourse.prerequisites}
                    onChange={(e) => setNewCourse({...newCourse, prerequisites: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                    placeholder="Basic JavaScript knowledge&#10;HTML and CSS fundamentals&#10;Familiarity with ES6"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowNewCourseForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Course
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseManager;