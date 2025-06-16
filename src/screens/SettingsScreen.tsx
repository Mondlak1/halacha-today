import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/useTheme';
import { UserPreferences, CustomType } from '../types/data';
import * as Location from 'expo-location';
import { setUserLocation } from '../services/hebrewDate';
import {
  setupAllNotifications,
  cancelAllNotifications,
  areNotificationsEnabled,
} from '../services/notifications';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, ThemeMode } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  saveApiConfig, 
  syncWithApi, 
  getApiConfig, 
  getLastSync, 
  validateApiConfig 
} from '../services/apiService';
import { saveGroqApiKey, testGroqApiConnection } from '../services/groqService';

// Default user preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  custom: 'Ashkenazi',
  notifications: true,
  reminderTimes: {
    shacharis: '08:00',
    mincha: '13:30',
    maariv: '19:00',
    other: [],
  },
};

// Time pattern validation
const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

// API settings storage keys
const API_ENDPOINT_KEY = 'halacha_api_endpoint';
const API_KEY_STORAGE_KEY = 'halacha_api_key';
const LAST_SYNC_KEY = 'last_api_sync';

const SettingsScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { themeMode, setThemeMode } = useThemeContext();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // User preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  
  // Location state
  const [locationStatus, setLocationStatus] = useState<'unknown' | 'loading' | 'granted' | 'denied'>('unknown');
  const [userLocation, setUserLocationState] = useState<{ latitude: number; longitude: number; } | null>(null);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // API configuration state
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Groq API configuration state
  const [groqApiKey, setGroqApiKey] = useState('');
  const [isGroqValidating, setIsGroqValidating] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        const prefsJson = await AsyncStorage.getItem('user_preferences');
        if (prefsJson) {
          const prefs = JSON.parse(prefsJson) as UserPreferences;
          setPreferences(prefs);
        }
        
        // Check location permission status
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationStatus(status === 'granted' ? 'granted' : 'denied');
        
        // Try to get current location if permission is granted
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocationState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        setIsError(true);
        setErrorMessage('Could not load settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Load saved API settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const config = await getApiConfig();
        const savedLastSync = await getLastSync();
        
        if (config) {
          setApiEndpoint(config.endpoint);
          setApiKey(config.apiKey);
        }
        
        if (savedLastSync) setLastSync(savedLastSync);
      } catch (error) {
        console.error('Failed to load API settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Handle tradition change
  const handleTraditionChange = (tradition: CustomType) => {
    setPreferences(prev => ({
      ...prev,
      custom: tradition,
    }));
    setHasChanges(true);
  };

  // Handle notification toggle
  const handleNotificationToggle = (value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: value,
    }));
    setHasChanges(true);
  };

  // Handle prayer time change
  const handlePrayerTimeChange = (prayer: 'shacharis' | 'mincha' | 'maariv', time: string) => {
    // Validate time format as user types
    if (time && !TIME_PATTERN.test(time)) {
      setValidationErrors(prev => ({
        ...prev,
        [prayer]: 'Invalid time format. Use HH:MM (24-hour format).',
      }));
    } else {
      // Clear error if valid
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[prayer];
        return newErrors;
      });
    }

    setPreferences(prev => ({
      ...prev,
      reminderTimes: {
        ...prev.reminderTimes,
        [prayer]: time,
      },
    }));
    setHasChanges(true);
  };

  // Request location permission and get current location
  const requestLocation = async () => {
    try {
      setLocationStatus('loading');
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationStatus('denied');
        Alert.alert(
          'Location Permission Denied',
          'Without location access, we\'ll use a default location for zmanim calculations. You can manually set your location or grant permission in your device settings.'
        );
        return;
      }
      
      setLocationStatus('granted');
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setUserLocationState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      // Show success message
      Alert.alert(
        'Location Updated',
        'Your current location will be used for accurate zmanim calculations.'
      );
      
      setHasChanges(true);
    } catch (error) {
      console.error('Error requesting location:', error);
      setLocationStatus('denied');
      Alert.alert(
        'Location Error',
        'Could not retrieve your location. Please try again or set it manually.'
      );
    }
  };

  // Save preferences
  const savePreferences = async () => {
    try {
      // Validate all required fields
      const errors: { [key: string]: string } = {};
      
      if (!preferences.custom) {
        errors.tradition = 'Tradition must be selected.';
      }
      
      Object.entries(preferences.reminderTimes).forEach(([key, value]) => {
        if (key !== 'other' && typeof value === 'string' && !TIME_PATTERN.test(value)) {
          errors[key] = 'Invalid time format. Use HH:MM (24-hour format).';
        }
      });
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        Alert.alert('Validation Error', 'Please fix the errors before saving.');
        return;
      }
      
      setIsSaving(true);
      
      // Save preferences to AsyncStorage
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
      
      // Update location for zmanim calculations if we have it
      if (userLocation) {
        await setUserLocation({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          elevation: 0,
          timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }
      
      // Update notifications based on settings
      if (preferences.notifications) {
        await setupAllNotifications();
      } else {
        await cancelAllNotifications();
      }
      
      setHasChanges(false);
      Alert.alert('Settings Saved', 'Your preferences have been updated successfully.');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Could not save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setPreferences(DEFAULT_PREFERENCES);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  // Save API configuration
  const handleSaveApiConfig = async () => {
    if (!apiEndpoint || !apiKey) {
      Alert.alert(
        'Missing Configuration',
        'Please enter both API endpoint and API key.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Validate the API configuration
      const isValid = await validateApiConfig(apiEndpoint, apiKey);
      
      if (!isValid) {
        Alert.alert(
          'Invalid Configuration',
          'Could not connect to the API. Please check your endpoint and API key.',
          [{ text: 'OK' }]
        );
        setIsValidating(false);
        return;
      }
      
      // Save the configuration
      const success = await saveApiConfig(apiEndpoint, apiKey);
      
      if (success) {
        Alert.alert(
          'Settings Saved',
          'Your API configuration has been saved.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save API settings:', error);
      Alert.alert(
        'Error',
        'Failed to save settings. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsValidating(false);
    }
  };
  
  // Sync data with the API
  const handleSyncWithApi = async () => {
    if (!apiEndpoint || !apiKey) {
      Alert.alert(
        'Missing Configuration',
        'Please enter both API endpoint and API key before syncing.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const success = await syncWithApi();
      
      if (success) {
        // Update the last sync time
        const newLastSync = await getLastSync();
        setLastSync(newLastSync);
        
        Alert.alert(
          'Sync Complete',
          'Successfully synchronized data with the API.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Sync operation failed');
      }
    } catch (error) {
      console.error('API sync failed:', error);
      Alert.alert(
        'Sync Failed',
        error instanceof Error ? error.message : 'An unknown error occurred',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Format the last sync date for display
  const getFormattedLastSync = () => {
    if (!lastSync) return 'Never';
    
    try {
      const date = new Date(lastSync);
      return date.toLocaleString();
    } catch (e) {
      return 'Unknown';
    }
  };

  // Handle saving Groq API key
  const handleSaveGroqApiKey = async () => {
    if (!groqApiKey) {
      Alert.alert(
        'Missing API Key',
        'Please enter your Groq API key before saving.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsGroqValidating(true);
    
    try {
      // Test the API connection
      const isValid = await testGroqApiConnection(groqApiKey);
      
      if (!isValid) {
        Alert.alert(
          'Invalid API Key',
          'Could not connect to the Groq API. Please check your API key.',
          [{ text: 'OK' }]
        );
        setIsGroqValidating(false);
        return;
      }
      
      // Save the API key
      const success = await saveGroqApiKey(groqApiKey);
      
      if (success) {
        Alert.alert(
          'API Key Saved',
          'Your Groq API key has been saved successfully.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Failed to save API key');
      }
    } catch (error) {
      console.error('Failed to save Groq API key:', error);
      Alert.alert(
        'Error',
        'Failed to save API key. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGroqValidating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading settings...
          </Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errorMessage || 'An error occurred loading settings.'}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsLoading(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your app preferences
          </Text>
        </View>
        
        {/* Theme Settings */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Theme Mode
            </Text>
            <View style={styles.themeButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  themeMode === 'light' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => setThemeMode('light')}
              >
                <Ionicons
                  name="sunny"
                  size={20}
                  color={themeMode === 'light' ? 'white' : colors.text}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  themeMode === 'dark' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => setThemeMode('dark')}
              >
                <Ionicons
                  name="moon"
                  size={20}
                  color={themeMode === 'dark' ? 'white' : colors.text}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  themeMode === 'system' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => setThemeMode('system')}
              >
                <Ionicons
                  name="phone-portrait"
                  size={20}
                  color={themeMode === 'system' ? 'white' : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Tradition Settings */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tradition Preference
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Select your tradition for halachic rulings
          </Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.traditionOption,
                preferences.custom === 'Ashkenazi' && { 
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary
                },
                { borderColor: colors.border }
              ]}
              onPress={() => handleTraditionChange('Ashkenazi')}
            >
              <Text style={[
                styles.traditionOptionText, 
                { color: preferences.custom === 'Ashkenazi' ? colors.primary : colors.text }
              ]}>
                Ashkenazi
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.traditionOption,
                preferences.custom === 'Sephardi' && { 
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary
                },
                { borderColor: colors.border }
              ]}
              onPress={() => handleTraditionChange('Sephardi')}
            >
              <Text style={[
                styles.traditionOptionText, 
                { color: preferences.custom === 'Sephardi' ? colors.primary : colors.text }
              ]}>
                Sephardi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notification Settings */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Configure notifications for prayers and special days
          </Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Enable Notifications
            </Text>
            <Switch
              value={preferences.notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={preferences.notifications ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>
          
          {/* Prayer time settings - only visible if notifications are enabled */}
          {preferences.notifications && (
            <>
              <Text style={[styles.settingGroupLabel, { color: colors.text }]}>
                Prayer Time Reminders
              </Text>
              
              <View style={styles.timeInputContainer}>
                <Text style={[styles.timeInputLabel, { color: colors.text }]}>
                  Shacharit
                </Text>
                <TextInput
                  style={[
                    styles.timeInput,
                    validationErrors.shacharis && styles.inputError,
                    { borderColor: colors.border, color: colors.text }
                  ]}
                  value={preferences.reminderTimes.shacharis}
                  onChangeText={(text) => handlePrayerTimeChange('shacharis', text)}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numbers-and-punctuation"
                />
                {validationErrors.shacharis && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {validationErrors.shacharis}
                  </Text>
                )}
              </View>
              
              <View style={styles.timeInputContainer}>
                <Text style={[styles.timeInputLabel, { color: colors.text }]}>
                  Mincha
                </Text>
                <TextInput
                  style={[
                    styles.timeInput,
                    validationErrors.mincha && styles.inputError,
                    { borderColor: colors.border, color: colors.text }
                  ]}
                  value={preferences.reminderTimes.mincha}
                  onChangeText={(text) => handlePrayerTimeChange('mincha', text)}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numbers-and-punctuation"
                />
                {validationErrors.mincha && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {validationErrors.mincha}
                  </Text>
                )}
              </View>
              
              <View style={styles.timeInputContainer}>
                <Text style={[styles.timeInputLabel, { color: colors.text }]}>
                  Maariv
                </Text>
                <TextInput
                  style={[
                    styles.timeInput,
                    validationErrors.maariv && styles.inputError,
                    { borderColor: colors.border, color: colors.text }
                  ]}
                  value={preferences.reminderTimes.maariv}
                  onChangeText={(text) => handlePrayerTimeChange('maariv', text)}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numbers-and-punctuation"
                />
                {validationErrors.maariv && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {validationErrors.maariv}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
        
        {/* Location Settings */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Location Settings
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Set your location for accurate zmanim calculations
          </Text>
          
          {/* Current location display */}
          <View style={styles.locationContainer}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Current Location:
            </Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {userLocation 
                ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                : 'Not set (using default location)'}
            </Text>
          </View>
          
          {/* Location permission button */}
          <TouchableOpacity
            style={[
              styles.locationButton,
              { backgroundColor: colors.primary },
              locationStatus === 'loading' && { opacity: 0.7 }
            ]}
            onPress={requestLocation}
            disabled={locationStatus === 'loading'}
          >
            {locationStatus === 'loading' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.locationButtonText}>
                {locationStatus === 'granted' 
                  ? 'Update Current Location'
                  : 'Request Location Permission'}
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Location permission explanation */}
          <Text style={[styles.locationExplanation, { color: colors.textSecondary }]}>
            {locationStatus === 'granted'
              ? 'Your device location is being used for accurate zmanim calculations.'
              : 'Location permission is needed for accurate prayer and Shabbat times based on your location.'}
          </Text>
          
          {/* Manual location option (placeholder for future enhancement) */}
          <TouchableOpacity
            style={[
              styles.manualLocationButton,
              { borderColor: colors.border }
            ]}
            onPress={() => Alert.alert(
              'Coming Soon',
              'Manual location entry will be available in a future update.'
            )}
          >
            <Text style={[styles.manualLocationText, { color: colors.text }]}>
              Set Location Manually
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* API Integration Settings */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            API Integration
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              API Endpoint
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }
              ]}
              value={apiEndpoint}
              onChangeText={setApiEndpoint}
              placeholder="https://api.example.com/v1"
              placeholderTextColor={colors.secondary}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              API Key
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }
              ]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your API key"
              placeholderTextColor={colors.secondary}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSaveApiConfig}
              disabled={isValidating}
            >
              {isValidating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  Save API Config
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.syncContainer}>
            <Text style={[styles.syncLabel, { color: colors.text }]}>
              Last Synchronized: {getFormattedLastSync()}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.syncButton,
                { backgroundColor: colors.primary },
                (isSyncing || isValidating) && { opacity: 0.7 }
              ]}
              onPress={handleSyncWithApi}
              disabled={isSyncing || isValidating}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="sync" size={18} color="white" />
                  <Text style={[styles.syncButtonText, { color: 'white' }]}>
                    Sync Now
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.apiHelpText, { color: colors.secondary }]}>
            Connect to an external API to import Jewish holidays, activities, 
            and other content. The API must conform to the Halacha Today format.
          </Text>
        </View>
        
        {/* Groq API Configuration */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Groq AI Integration
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.secondary }]}>
            Connect to Groq's AI services for enhanced explanations of Jewish practices
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Groq API Key
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }
              ]}
              value={groqApiKey}
              onChangeText={setGroqApiKey}
              placeholder="Enter your Groq API key"
              placeholderTextColor={colors.secondary}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSaveGroqApiKey}
              disabled={isGroqValidating}
            >
              {isGroqValidating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  Save Groq API Key
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.apiHelpText, { color: colors.secondary }]}>
            Groq AI will be used to provide detailed explanations of Jewish practices and 
            answer questions about halacha. API keys can be obtained from groq.com.
          </Text>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          
          <Text style={[styles.versionText, { color: colors.text }]}>
            Halacha Today v1.0.0
          </Text>
          
          <Text style={[styles.aboutText, { color: colors.secondary }]}>
            Your daily companion for navigating Jewish observance with practical 
            guidance and timely reminders.
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Save button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              (!hasChanges || isSaving) && { opacity: 0.7 }
            ]}
            onPress={savePreferences}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Reset button */}
          <TouchableOpacity
            style={[
              styles.resetButton,
              { borderColor: colors.border, backgroundColor: colors.background }
            ]}
            onPress={resetToDefaults}
          >
            <Text style={[styles.resetButtonText, { color: colors.error }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  traditionOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  traditionOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginVertical: 8,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  locationText: {
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
  locationButton: {
    padding: 8,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationExplanation: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  manualLocationButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  manualLocationText: {
    fontSize: 16,
  },
  actionButtonsContainer: {
    marginTop: 16,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
  themeButtonsContainer: {
    flexDirection: 'row',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  syncContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncLabel: {
    fontSize: 14,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  apiHelpText: {
    fontSize: 14,
    marginTop: 16,
    fontStyle: 'italic',
  },
  versionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SettingsScreen;
