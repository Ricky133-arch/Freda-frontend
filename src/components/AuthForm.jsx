import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, TextField, Box, Typography, Paper, Alert } from '@mui/material';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
        console.log('Login successful, navigating to /welcome');
        navigate('/welcome', { replace: true }); // Added replace: true
      } else {
        await signup(email, password, name);
        console.log('Signup successful, navigating to /welcome');
        navigate('/welcome', { replace: true });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Authentication failed';
      console.error('Auth error:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        maxWidth: 400,
        margin: 'auto',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, rgba(255,107,107,0.2), rgba(255,224,102,0.2))',
          zIndex: -1,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4, background: 'rgba(255, 255, 255, 0.95)' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ x: isLogin ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLogin ? -50 : 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h4" gutterBottom>
              {isLogin ? 'Login to Freda' : 'Sign Up for Freda'}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {!isLogin && (
                <TextField
                  label="Name"
                  fullWidth
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </Button>
            </Box>
            <Button
              onClick={() => setIsLogin(!isLogin)}
              sx={{ mt: 2 }}
              color="secondary"
            >
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </Paper>
    </motion.div>
  );
}