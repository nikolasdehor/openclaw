import React, { createContext, useContext, ReactNode } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Theme } from './theme';

const ThemeContext = createContext<Theme>({} as Theme);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme: Theme = {
    Colors,
    Typography,
    Spacing,
    BorderRadius,
    Shadows,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
