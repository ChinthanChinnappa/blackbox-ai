// Auth hook — reads user from localStorage
import { useState, useEffect } from 'react';
import { logout } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      // EDGE CASE: corrupted localStorage value — silently returns null
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const signOut = () => {
    logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (newUser) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return { user, token, isAuthenticated: !!token, signOut, updateUser };
};
