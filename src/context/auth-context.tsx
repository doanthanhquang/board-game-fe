/**
 * Authentication Context Provider
 * Provides authentication state and functions throughout the application
 */

import { useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, type User, type LoginRequest } from '@/api/auth';
import type { AuthContextType } from '@/context/auth-context-types';
import { AuthContext } from '@/context/auth-context-export';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * Manages authentication state and provides it to child components
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch {
          // Invalid user data, clear it
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   * Authenticates user and stores token and user info
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    const response = await apiLogin(credentials);

    // Store token and user info
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));

    // Update state
    setCurrentUser(response.user);
    setIsAuthenticated(true);
  };

  /**
   * Logout function
   * Clears authentication state
   */
  const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
