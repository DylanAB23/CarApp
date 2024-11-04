import { useState, useCallback } from 'react';

interface User {
  email: string;
  name: string;
}

// Demo credentials
const DEMO_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
  name: 'Admin User'
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    // Simple credential check for demo purposes
    if (email.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() && 
        password === DEMO_CREDENTIALS.password) {
      const userData = {
        email: DEMO_CREDENTIALS.email,
        name: DEMO_CREDENTIALS.name
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return userData;
    }
    
    throw new Error('Invalid credentials');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    user,
    login,
    logout
  };
}