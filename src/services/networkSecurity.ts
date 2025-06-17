import { Platform } from 'react-native';
import { userDataService } from './userDataService';
import { secureStorage } from './secureStorage';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.halachatoday.com';
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class NetworkSecurity {
  private static instance: NetworkSecurity;
  private retryCount: number = 0;

  private constructor() {}

  static getInstance(): NetworkSecurity {
    if (!NetworkSecurity.instance) {
      NetworkSecurity.instance = new NetworkSecurity();
    }
    return NetworkSecurity.instance;
  }

  private async getHeaders(): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Platform': Platform.OS,
      'X-App-Version': process.env.APP_VERSION || '1.0.0',
    });

    const token = await userDataService.getSessionToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized access
        await userDataService.clearUserData();
        throw new Error('Session expired');
      }
      if (response.status === 429) {
        // Handle rate limiting
        const retryAfter = response.headers.get('Retry-After');
        if (retryAfter) {
          await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
          return this.retryRequest<T>(response.url, response);
        }
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  }

  private async retryRequest<T>(url: string, originalResponse: Response): Promise<ApiResponse<T>> {
    if (this.retryCount >= MAX_RETRIES) {
      this.retryCount = 0;
      throw new Error('Max retries exceeded');
    }

    this.retryCount++;
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * this.retryCount));

    const headers = await this.getHeaders();
    const response = await fetch(url, {
      method: originalResponse.type === 'default' ? 'GET' : originalResponse.type,
      headers,
      body: originalResponse.body,
    });

    return this.handleResponse<T>(response);
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Network error');
    } finally {
      this.retryCount = 0;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}${endpoint}`);

    const headers = await this.getHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.send(formData);
    });
  }
}

export const networkSecurity = NetworkSecurity.getInstance(); 