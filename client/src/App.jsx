// Root component that sets up React Router, wraps the app in AuthProvider,
// and initializes the dark mode hook on the document root.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useDarkMode from './hooks/useDarkMode';

import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import JoinGroup from './pages/JoinGroup';
import Profile from './pages/Profile';

const AppContent = () => {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <>
                  <Navbar isDark={isDark} toggleDarkMode={toggleDarkMode} />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/groups/:id" element={<GroupDetail />} />
                      <Route path="/join/:inviteCode" element={<JoinGroup />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
