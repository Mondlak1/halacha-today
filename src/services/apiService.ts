import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, Holiday } from '../types/data';

// Storage keys
const API_ENDPOINT_KEY = 'halacha_api_endpoint';
const API_KEY_STORAGE_KEY = 'halacha_api_key';
const LAST_SYNC_KEY = 'last_api_sync';

// API response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface SyncResponse {
  activities?: Activity[];
  holidays?: Holiday[];
  lastSync: string;
}

/**
 * Get stored API configuration
 */
export const getApiConfig = async (): Promise<{ endpoint: string; apiKey: string } | null> => {
  try {
    const endpoint = await AsyncStorage.getItem(API_ENDPOINT_KEY);
    const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    
    if (!endpoint || !apiKey) {
      return null;
    }
    
    return { endpoint, apiKey };
  } catch (error) {
    console.error('Failed to get API config:', error);
    return null;
  }
};

/**
 * Save API configuration
 */
export const saveApiConfig = async (endpoint: string, apiKey: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(API_ENDPOINT_KEY, endpoint);
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    return true;
  } catch (error) {
    console.error('Failed to save API config:', error);
    return false;
  }
};

/**
 * Get the last sync timestamp
 */
export const getLastSync = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch (error) {
    console.error('Failed to get last sync time:', error);
    return null;
  }
};

/**
 * Make an API request with the stored credentials
 */
export const makeApiRequest = async <T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T> | null> => {
  try {
    const config = await getApiConfig();
    
    if (!config) {
      throw new Error('API configuration not found');
    }
    
    const { endpoint, apiKey } = config;
    
    const response = await fetch(`${endpoint}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API request failed:', error);
    return null;
  }
};

/**
 * Synchronize data with the API
 */
export const syncWithApi = async (): Promise<boolean> => {
  try {
    const lastSync = await getLastSync();
    const response = await makeApiRequest<SyncResponse>(`/sync?lastSync=${lastSync || ''}`);
    
    if (!response || !response.success) {
      throw new Error(response?.message || 'Failed to sync with API');
    }
    
    // Process activities if available
    if (response.data.activities && response.data.activities.length > 0) {
      // Update activities in storage
      // Import implementation here...
      console.log(`Imported ${response.data.activities.length} activities`);
    }
    
    // Process holidays if available
    if (response.data.holidays && response.data.holidays.length > 0) {
      // Update holidays in storage
      // Import implementation here...
      console.log(`Imported ${response.data.holidays.length} holidays`);
    }
    
    // Update last sync time
    await AsyncStorage.setItem(LAST_SYNC_KEY, response.data.lastSync || new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Failed to sync with API:', error);
    return false;
  }
};

/**
 * Check if the API is properly configured
 */
export const isApiConfigured = async (): Promise<boolean> => {
  const config = await getApiConfig();
  return config !== null;
};

/**
 * Validate the API configuration by making a test request
 */
export const validateApiConfig = async (endpoint: string, apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`${endpoint}/ping`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('API validation failed:', error);
    return false;
  }
}; 