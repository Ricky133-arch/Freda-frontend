// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import AuthForm from './components/AuthForm.jsx';
import Welcome from './components/Welcome.jsx';
import Profile from './components/Profile.jsx';
import Chat from './components/Chat.jsx';
import { motion } from 'framer-motion';

function AppContent() {
  const { user } = useContext(AuthContext);
  console.log('Current user state:', user); // Debug user state

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth */}
          <Route
            path="/auth"
            element={!user ? <AuthForm /> : <Navigate to="/welcome" replace />}
          />

          {/* Protected pages */}
          <Route
            path="/welcome"
            element={user ? <Welcome /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/auth" replace />}
          />
          {/* DM / Group chat – exact match on :chatId */}
          <Route
            path="/chat/:chatId"
            element={user ? <Chat /> : <Navigate to="/auth" replace />}
          />

          {/* Root redirect */}
          <Route
            path="/"
            element={<Navigate to={user ? '/welcome' : '/auth'} replace />}
          />

          {/* Catch-all – keep user inside the app */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AppContent />
      </motion.div>
    </AuthProvider>
  );
}

export default App;