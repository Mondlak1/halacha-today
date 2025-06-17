import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

class SecureStorage {
  private static instance: SecureStorage;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await SecureStore.isAvailableAsync();
      this.initialized = true;
    } catch (error) {
      throw new Error('Secure storage is not available on this device');
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    try {
      const encryptedValue = this.encrypt(value);
      await SecureStore.setItemAsync(key, encryptedValue);
    } catch (error) {
      throw new Error('Failed to store data securely');
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.initialized) await this.initialize();
    
    try {
      const encryptedValue = await SecureStore.getItemAsync(key);
      if (!encryptedValue) return null;
      
      return this.decrypt(encryptedValue);
    } catch (error) {
      throw new Error('Failed to retrieve data securely');
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      throw new Error('Failed to remove data securely');
    }
  }

  private encrypt(value: string): string {
    try {
      return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  private decrypt(value: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(value, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  async clearAll(): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    try {
      // Get all keys from secure store
      const keys = await SecureStore.getAllKeysAsync();
      
      // Remove each key
      await Promise.all(keys.map(key => this.removeItem(key)));
    } catch (error) {
      throw new Error('Failed to clear secure storage');
    }
  }
}

export const secureStorage = SecureStorage.getInstance(); 