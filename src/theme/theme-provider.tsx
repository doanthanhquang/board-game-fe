import { useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '@/theme/themes';
import { ThemeContext, type ThemeMode } from '@/theme/theme-context';

const THEME_STORAGE_KEY = 'theme-preference';

/**
 * Get initial theme mode from localStorage or system preference
 */
const getInitialTheme = (): ThemeMode => {
  // Check localStorage first
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  // Default to light
  return 'light';
};

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component that manages theme state and persistence
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  // Sync dark class with theme mode
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      // Save to localStorage
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
      } catch (error) {
        console.warn('Failed to save theme preference to localStorage:', error);
      }
      return newMode;
    });
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
