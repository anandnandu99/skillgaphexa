import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ContinueLearning from './pages/ContinueLearning';
import ExploreCourses from './pages/ExploreCourses';
import SkillAssessment from './pages/SkillAssessment';
import UserProfile from './components/UserProfile';
import CourseDetail from './components/CourseDetail';
import InteractiveQuiz from './components/InteractiveQuiz';
import ProgressTracker from './components/ProgressTracker';
import StudyGroups from './components/StudyGroups';
import AssessmentDetail from './components/AssessmentDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import { userStorage, User } from './utils/userStorage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = userStorage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    userStorage.setCurrentUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    userStorage.clearCurrentUser();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header user={user!} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage user={user!} />} />
          <Route path="/continue-learning" element={<ContinueLearning user={user!} />} />
          <Route path="/explore-courses" element={<ExploreCourses />} />
          <Route path="/skill-assessment" element={<SkillAssessment user={user!} />} />
          <Route path="/assessment/:id" element={<AssessmentDetail user={user!} />} />
          <Route path="/profile" element={<UserProfile user={user!} />} />
          <Route path="/course/:id" element={<CourseDetail user={user!} />} />
          <Route path="/quiz/:id" element={<InteractiveQuiz />} />
          <Route path="/progress" element={<ProgressTracker user={user!} />} />
          <Route path="/study-groups" element={<StudyGroups />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;