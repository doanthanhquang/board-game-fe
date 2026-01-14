import { createContext } from 'react';
import type { AuthContextType } from '@/context/auth-context-types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
