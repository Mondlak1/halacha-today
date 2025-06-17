type LogLevel = 'error' | 'debug';

interface SecurityConfigType {
  API: {
    BASE_URL: string;
    TIMEOUT: number;
    MAX_RETRIES: number;
    RETRY_DELAY: number;
  };
  STORAGE: {
    ENCRYPTION_KEY: string;
    USER_DATA_KEY: string;
    SESSION_TOKEN_KEY: string;
    PREFERENCES_KEY: string;
  };
  AUTH: {
    GOOGLE: {
      EXPO_CLIENT_ID?: string;
      IOS_CLIENT_ID?: string;
      ANDROID_CLIENT_ID?: string;
      WEB_CLIENT_ID?: string;
    };
    TOKEN_EXPIRY: number;
  };
  NETWORK: {
    ALLOWED_ORIGINS: string[];
    CORS_ENABLED: boolean;
    RATE_LIMIT: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
  };
  UPLOAD: {
    MAX_FILE_SIZE: number;
    ALLOWED_TYPES: string[];
    MAX_FILES: number;
  };
  ERROR: {
    MAX_RETRIES: number;
    RETRY_DELAY: number;
    LOG_LEVEL: LogLevel;
  };
}

const baseConfig: SecurityConfigType = {
  // API Configuration
  API: {
    BASE_URL: process.env.API_BASE_URL || 'https://api.halachatoday.com',
    TIMEOUT: 10000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },

  // Storage Configuration
  STORAGE: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
    USER_DATA_KEY: 'user_data',
    SESSION_TOKEN_KEY: 'session_token',
    PREFERENCES_KEY: 'preferences',
  },

  // Authentication Configuration
  AUTH: {
    GOOGLE: {
      EXPO_CLIENT_ID: process.env.GOOGLE_EXPO_CLIENT_ID,
      IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
      ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
      WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
    },
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Network Security
  NETWORK: {
    ALLOWED_ORIGINS: ['https://api.halachatoday.com', 'https://halachatoday.com'],
    CORS_ENABLED: true,
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100,
    },
  },

  // File Upload Security
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    MAX_FILES: 5,
  },

  // Error Handling
  ERROR: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    LOG_LEVEL: 'error',
  },
};

export const SECURITY_CONFIG = baseConfig;

// Helper function to get environment-specific configuration
export const getSecurityConfig = (): SecurityConfigType => {
  const env = process.env.NODE_ENV || 'development';
  
  const developmentConfig: SecurityConfigType = {
    ...baseConfig,
    API: {
      ...baseConfig.API,
      BASE_URL: 'http://localhost:3000',
    },
    ERROR: {
      ...baseConfig.ERROR,
      LOG_LEVEL: 'debug',
    },
  };

  const productionConfig: SecurityConfigType = {
    ...baseConfig,
    ERROR: {
      ...baseConfig.ERROR,
      LOG_LEVEL: 'error',
    },
  };

  const envConfig = {
    development: developmentConfig,
    production: productionConfig,
  };

  return envConfig[env as keyof typeof envConfig] || baseConfig;
}; 