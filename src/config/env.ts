import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: 'your-google-client-id',
    GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
  },
  staging: {
    API_URL: 'https://staging-api.halachatoday.com',
    GOOGLE_CLIENT_ID: 'your-google-client-id',
    GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
  },
  prod: {
    API_URL: 'https://api.halachatoday.com',
    GOOGLE_CLIENT_ID: 'your-google-client-id',
    GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
  },
};

const getEnvVars = () => {
  const env = Constants.expoConfig?.extra?.ENV || 'dev';
  return ENV[env as keyof typeof ENV];
};

export default {
  ...getEnvVars(),
  APP: {
    VERSION: '1.0.0',
    BUILD: '1',
  },
}; 