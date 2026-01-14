/**
 * Authentication Context Types
 * Separated for Fast Refresh compatibility
 */

import type { User, LoginRequest } from '@/api/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}
