import { Theme } from '../hooks/useTheme';

// Light theme colors
export const lightTheme: Theme = {
  colors: {
    primary: '#8e6f3d',      // Rich gold color
    secondary: '#6d4c41',     // Brown
    background: '#f9f5e9',    // Light cream
    card: '#ffffff',         // White
    text: '#2c2c2c',          // Dark gray
    border: '#e0d6c2',        // Light brown
    notification: '#8e6f3d',   // Same as primary
    error: '#d32f2f',         // Red
    success: '#388e3c',       // Green
    warning: '#f57c00',        // Orange
    // Jewish-specific colors
    regular: '#8e6f3d',       // Gold
    shabbat: '#1976d2',       // Blue
    yomTov: '#c62828',        // Dark red
    fastDay: '#5d4037',        // Dark brown
    roshChodesh: '#7b1fa2',    // Purple
    // Status colors
    allowed: '#388e3c',       // Green
    forbidden: '#d32f2f',       // Red
    conditional: '#f57c00',      // Orange
    // Additional colors
    textSecondary: '#666666',   // Medium gray
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
  },
};

// Dark theme colors
export const darkTheme: Theme = {
  colors: {
    primary: '#d4b483',      // Light gold
    secondary: '#a1887f',     // Light brown
    background: '#1a1a1a',     // Dark gray
    card: '#2d2d2d',          // Darker gray
    text: '#ffffff',          // White
    border: '#3d3d3d',         // Medium gray
    notification: '#d4b483',    // Same as primary
    error: '#ef5350',          // Light red
    success: '#66bb6a',        // Light green
    warning: '#ffa726',         // Light orange
    // Jewish-specific colors
    regular: '#d4b483',         // Light gold
    shabbat: '#42a5f5',         // Light blue
    yomTov: '#ef5350',          // Light red
    fastDay: '#8d6e63',          // Light brown
    roshChodesh: '#ab47bc',      // Light purple
    // Status colors
    allowed: '#66bb6a',          // Light green
    forbidden: '#ef5350',          // Light red
    conditional: '#ffa726',          // Light orange
    // Additional colors
    textSecondary: '#b0b0b0',      // Light gray
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
  },
}; 