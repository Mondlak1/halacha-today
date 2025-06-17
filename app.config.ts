import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Halacha Today',
  slug: 'halacha-today',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/your-project-id'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.halachatoday.app',
    buildNumber: '1',
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ['com.googleusercontent.apps.your-google-client-id']
        }
      ]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.halachatoday.app',
    versionCode: 1,
    googleServicesFile: './google-services.json'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-localization',
    'expo-secure-store',
    'expo-location',
    'expo-notifications'
  ],
  extra: {
    ENV: process.env.APP_ENV || 'dev'
  }
}); 