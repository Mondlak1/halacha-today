import { Theme } from '../hooks/useTheme';

// Light theme colors (inspired by Trantor app)
export const lightTheme: Theme = {
  colors: {
    primary: '#1E88E5',      // A soft blue for main accents (e.g., buttons, icons)
    secondary: '#FFD54F',     // A soft yellow for secondary accents
    background: '#F9F9F9',    // Very light grey background
    card: '#FFFFFF',         // White for card backgrounds
    text: '#212121',          // Dark grey for primary text
    border: '#EEEEEE',        // Very light grey for subtle borders
    notification: '#EF5350',   // Red for notifications/errors
    error: '#E53935',         // Stronger red for errors
    success: '#4CAF50',       // Green for success
    warning: '#FFC107',        // Amber for warnings
    // Trantor specific accents
    accent1: '#B1F3E1',       // Light blue/teal background for sections
    accent2: '#FFEB99',       // Soft yellow background for sections
    accent3: '#E1B1F3',       // Light purple background for sections
    // General colors
    textSecondary: '#757575',   // Medium grey for secondary text
    gradientStart: '#E0F2F7',  // Lighter blue for gradients
    gradientEnd: '#FFFDE7',    // Lighter yellow for gradients

    // Keep original Jewish-specific and status colors for now, adjust as needed with new UI
    regular: '#8e6f3d',
    shabbat: '#1976d2',
    yomTov: '#c62828',
    fastDay: '#5d4037',
    roshChodesh: '#7b1fa2',
    allowed: '#388e3c',
    forbidden: '#d32f2f',
    conditional: '#f57c00',
  },
  spacing: {
    xs: 6,
    s: 12,
    m: 20,
    l: 30,
    xl: 40,
    xxl: 60,
  },
  borderRadius: {
    small: 8,
    medium: 16,
    large: 24,
  },
  fontSize: {
    small: 13,
    medium: 15,
    large: 17,
    xlarge: 22,
    xxlarge: 28,
  },
};

// Dark theme colors (inspired by Trantor app - adapted for dark mode)
export const darkTheme: Theme = {
  colors: {
    primary: '#64B5F6',      // Lighter blue for main accents
    secondary: '#FFEE58',     // Lighter yellow for secondary accents
    background: '#121212',    // Dark background
    card: '#1E1E1E',         // Darker grey for card backgrounds
    text: '#E0E0E0',          // Light grey for primary text
    border: '#333333',        // Dark grey for subtle borders
    notification: '#E57373',   // Lighter red for notifications/errors
    error: '#EF5350',         // Red for errors
    success: '#81C784',       // Light green for success
    warning: '#FFD54F',        // Light amber for warnings
    // Trantor specific accents (adapted for dark mode)
    accent1: '#004D40',       // Darker teal background for sections
    accent2: '#795548',       // Darker brown/orange background for sections
    accent3: '#4A148C',       // Darker purple background for sections
    // General colors
    textSecondary: '#B0B0B0',   // Lighter grey for secondary text
    gradientStart: '#263238',  // Darker blue-grey for gradients
    gradientEnd: '#424242',    // Medium dark grey for gradients

    // Keep original Jewish-specific and status colors for now, adjust as needed with new UI
    regular: '#d4b483',
    shabbat: '#42a5f5',
    yomTov: '#ef5350',
    fastDay: '#8d6e63',
    roshChodesh: '#ab47bc',
    allowed: '#66bb6a',
    forbidden: '#ef5350',
    conditional: '#ffa726',
  },
  spacing: {
    xs: 6,
    s: 12,
    m: 20,
    l: 30,
    xl: 40,
    xxl: 60,
  },
  borderRadius: {
    small: 8,
    medium: 16,
    large: 24,
  },
  fontSize: {
    small: 13,
    medium: 15,
    large: 17,
    xlarge: 22,
    xxlarge: 28,
  },
}; 