import { secureStorage } from './secureStorage';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    location?: {
      latitude: number;
      longitude: number;
      name: string;
    };
  };
  lastSync: number;
}

const USER_DATA_KEY = 'user_data';
const SESSION_TOKEN_KEY = 'session_token';

class UserDataService {
  private static instance: UserDataService;
  private userData: UserData | null = null;

  private constructor() {}

  static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const storedData = await secureStorage.getItem(USER_DATA_KEY);
      if (storedData) {
        this.userData = JSON.parse(storedData);
      }
    } catch (error) {
      // Handle initialization error
      this.userData = null;
    }
  }

  async setUserData(data: Partial<UserData>): Promise<void> {
    try {
      this.userData = {
        ...this.userData,
        ...data,
        lastSync: Date.now(),
      } as UserData;

      await secureStorage.setItem(USER_DATA_KEY, JSON.stringify(this.userData));
    } catch (error) {
      throw new Error('Failed to save user data');
    }
  }

  async getUserData(): Promise<UserData | null> {
    if (!this.userData) {
      await this.initialize();
    }
    return this.userData;
  }

  async setSessionToken(token: string): Promise<void> {
    try {
      await secureStorage.setItem(SESSION_TOKEN_KEY, token);
    } catch (error) {
      throw new Error('Failed to save session token');
    }
  }

  async getSessionToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(SESSION_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  async clearUserData(): Promise<void> {
    try {
      this.userData = null;
      await secureStorage.removeItem(USER_DATA_KEY);
      await secureStorage.removeItem(SESSION_TOKEN_KEY);
    } catch (error) {
      throw new Error('Failed to clear user data');
    }
  }

  async updatePreferences(preferences: Partial<UserData['preferences']>): Promise<void> {
    if (!this.userData) {
      throw new Error('No user data available');
    }

    try {
      await this.setUserData({
        preferences: {
          ...this.userData.preferences,
          ...preferences,
        },
      });
    } catch (error) {
      throw new Error('Failed to update preferences');
    }
  }
}

export const userDataService = UserDataService.getInstance(); 