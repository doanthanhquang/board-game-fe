import { useContext } from 'react';
import { ThemeContext } from '@/theme/theme-context';

/**
 * Custom hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
