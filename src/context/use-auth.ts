import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context-export';
import type { AuthContextType } from '@/context/auth-context-types';

/**
 * useAuth hook
 * Provides access to authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
