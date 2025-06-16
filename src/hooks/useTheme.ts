import { useColorScheme } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

// Define the theme structure
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    // Jewish-specific colors
    regular: string;
    shabbat: string;
    yomTov: string;
    fastDay: string;
    roshChodesh: string;
    // Status colors
    allowed: string;
    forbidden: string;
    conditional: string;
    // Additional colors
    textSecondary: string;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
}

/**
 * Custom hook to access theme values
 * Uses the ThemeContext or falls back to system preference
 */
export const useTheme = () => {
  const themeContext = useThemeContext();
  
  // If theme context is available, use it
  if (themeContext) {
    const { theme, isDark } = themeContext;
    return {
      ...theme,
      isDark,
    };
  }
  
  // Fallback to system preference if context is not available
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return { 
    ...isDark ? darkTheme : lightTheme,
    isDark,
  };
};

