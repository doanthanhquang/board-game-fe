import type { User, LoginRequest } from '@/api/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

/**
 * Check if the current user is an admin
 * @param user - User object or null
 * @returns true if user is an admin, false otherwise
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

/**
 * Check if the current user is a client
 * @param user - User object or null
 * @returns true if user is a client, false otherwise
 */
export const isClient = (user: User | null): boolean => {
  return user?.role === 'client';
};
