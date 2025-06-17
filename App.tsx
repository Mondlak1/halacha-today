import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { setUserLocation } from './src/services/hebrewDate';
import { shouldTriggerImport, importHolidayData, preloadHolidayImages } from './src/services/aiService';
import JewishLoadingSpinner from './src/components/JewishLoadingSpinner';

// Import services
import { initializeNotifications } from './src/services/notifications';


// Update the ErrorBoundary component props type
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// Error boundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false, errorMessage: '' };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{this.state.errorMessage}</Text>
          <Text style={styles.errorHint}>Please restart the app</Text>
        </View>
      );
    }
    
    return this.props.children;
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  useEffect(() => {
    async function prepare() {
      try {
        // Request location permissions
        setLoadingMessage('Requesting location permissions...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          // Get user's location
          setLoadingMessage('Getting your location...');
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          // Set location for Zmanim calculations
          if (location) {
            console.log('Location initialized:', location.coords);
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              elevation: location.coords.altitude || 0,
              timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
              locationName: 'Current Location',
              isDefault: false,
            });
          }
        }
        
        // Check if we need to import holiday data
        setLoadingMessage('Checking calendar data...');
        const shouldImport = await shouldTriggerImport();
        
        if (shouldImport) {
          // Import holiday data
          setLoadingMessage('Importing Jewish calendar data...');
          
          // Import current year
          const currentYear = new Date().getFullYear();
          await importHolidayData(currentYear);
          
          // If we're close to the end of the year, also import next year
          const currentMonth = new Date().getMonth(); // 0-11
          if (currentMonth >= 10) { // If November or December
            setLoadingMessage(`Importing data for ${currentYear + 1}...`);
            await importHolidayData(currentYear + 1);
          }
          
          // Preload holiday images
          setLoadingMessage('Preparing visuals...');
          await preloadHolidayImages();
        }

        // Initialize notifications
        setLoadingMessage('Setting up notifications...');
        await initializeNotifications();

        // App is ready
        setIsReady(true);
      } catch (e) {
        console.warn('Error during initialization:', e);
        // Continue without location data
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <JewishLoadingSpinner size={80} />
        <Text style={{ marginTop: 16, fontSize: 16 }}>{loadingMessage}</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Styles for loading and error screens
const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});
