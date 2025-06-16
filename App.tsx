import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { setUserLocation } from './src/services/hebrewDate';
import { shouldTriggerImport, importHolidayData, preloadHolidayImages } from './src/services/aiService';
import JewishLoadingSpinner from './src/components/JewishLoadingSpinner';

// Import services
import { initializeActivities } from './src/services/activities';
import { initializeNotifications, setupAllNotifications } from './src/services/notifications';
import { getHebcalDayData, HebcalDayData } from './src/services/hebcalService';
import { getActivitiesByDayType } from './src/services/activities';
import { Activity } from './src/types/data';

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
  const [locationError, setLocationError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [hebcalData, setHebcalData] = useState<HebcalDayData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLocationError(e as Error);
        // Continue without location data
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getHebcalDayData();
        setHebcalData(data);
        const dayActivities = await getActivitiesByDayType(data.dayType);
        setActivities(dayActivities);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <JewishLoadingSpinner size={80} />
        <Text style={{ marginTop: 16, fontSize: 16 }}>{loadingMessage}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!hebcalData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading data</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <ScrollView style={styles.container}>
            <Text style={styles.title}>Halacha Today</Text>
            <Text style={styles.date}>📅 {hebcalData.date}</Text>
            
            <Text style={styles.subtitle}>📌 Events:</Text>
            {hebcalData.events.map((event, index) => (
              <Text key={index} style={styles.eventText}>• {event.name}</Text>
            ))}

            <Text style={styles.subtitle}>🔎 Activities for {hebcalData.dayType}:</Text>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.activityContainer}>
                <Text style={styles.activityTitle}>
                  {activity.statusByDay[hebcalData.dayType] === 'allowed' ? '✅' : '❌'} {activity.title}
                </Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityExplanation}>
                  {activity.explanation[hebcalData.dayType]}
                </Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Styles for loading and error screens
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  date: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  eventText: {
    fontSize: 16,
    marginBottom: 5,
  },
  activityContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  activityExplanation: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});
