import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      return decoded.exp < currentTime;
    } catch (err) {
      console.error('Token decode error:', err);
      return true; // Treat invalid tokens as expired
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token on load:', decoded);
        setUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          profilePhoto: decoded.profilePhoto || null, // Fixed: Use profilePhoto from token
        });
      } catch (err) {
        console.error('Token decode error:', err);
        localStorage.removeItem('token');
      }
    } else if (token) {
      console.log('Token expired or invalid, removing...');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      setUser({
        id: res.data.user.id,
        email: res.data.user.email,
        name: res.data.user.name,
        profilePhoto: res.data.user.profilePhoto || null,
      });
      return res.data;
    } catch (err) {
      console.error('Login error:', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (email, password, name) => {
    try {
      const res = await api.post('/auth/signup', { email, password, name });
      console.log('Signup response:', res.data);
      localStorage.setItem('token', res.data.token);
      setUser({
        id: res.data.user.id,
        email: res.data.user.email,
        name: res.data.user.name,
        profilePhoto: res.data.user.profilePhoto || null,
      });
      return res.data;
    } catch (err) {
      console.error('Signup error:', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
      throw new Error(err.response?.data?.message || 'Signup failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        setUser(null);
        throw new Error('Session expired. Please log in again.');
      }

      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Profile update response:', res.data);

      // Fixed: Update user with fresh data from server
      const updatedUser = {
        id: res.data.user.id,
        email: res.data.user.email,
        name: res.data.user.name,
        profilePhoto: res.data.user.profilePhoto || null,
      };
      setUser(updatedUser);

      // Fixed: Save new token if backend returns one
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      return res.data;
    } catch (err) {
      console.error('Profile update error:', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
      const errorMessage = err.response?.status === 401
        ? 'Session expired. Please log in again.'
        : err.response?.data?.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};