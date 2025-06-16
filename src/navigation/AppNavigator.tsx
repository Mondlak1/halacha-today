import React, { useEffect, useRef } from 'react';
import { NavigationContainer, LinkingOptions, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StatusBar, useColorScheme, Appearance, SafeAreaView } from 'react-native';
import * as Notifications from 'expo-notifications';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ActivityListScreen from '../screens/ActivityListScreen';
import ActivityDetailsScreen from '../screens/ActivityDetailsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import types
import { RootStackParamList, MainTabParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import { 
  setupNotificationListener, 
  setupNotificationResponseListener 
} from '../services/notifications';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator
const MainTabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activities" component={ActivityListScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Define linking configuration for deep links and notifications
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['halachatoday://', 'https://halachatoday.app'],
  config: {
    initialRouteName: 'Main',
    screens: {
      Main: {
        initialRouteName: 'Home',
        screens: {
          Home: 'home',
          Activities: 'activities',
          Calendar: 'calendar',
          Settings: 'settings',
        },
      },
      ActivityDetail: {
        path: 'activity/:activityId',
        parse: {
          activityId: (id: string) => id,
        },
      },
    },
  },
};

// Stack navigator that includes the main tabs and the activity detail screen
const AppNavigator = () => {
  const { colors, isDark } = useTheme();
  const navigationRef = useRef<any>(null);
  const colorScheme = useColorScheme();
  
  // Set up notification listeners
  useEffect(() => {
    // Handle notifications received while app is in foreground
    const foregroundSubscription = setupNotificationListener((notification) => {
      console.log('Notification received in foreground:', notification);
    });
    
    // Handle notification responses (when user taps on notification)
    const responseSubscription = setupNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      
      // Navigate based on notification type
      if (data.type === 'activity' && data.activityId) {
        navigationRef.current?.navigate('ActivityDetail', {
          activityId: data.activityId,
          activityName: data.name || 'Activity',
          dayType: data.dayType,
          tradition: data.tradition,
        });
      } else if (data.type === 'prayer') {
        navigationRef.current?.navigate('Main', { screen: 'Home' });
      } else if (data.type === 'special_day') {
        navigationRef.current?.navigate('Main', { screen: 'Calendar' });
      }
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      foregroundSubscription();
      responseSubscription();
    };
  }, []);
  
  // Create custom theme that matches app's theme
  const appTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer 
        ref={navigationRef}
        theme={appTheme}
        linking={linking}
      >
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
          backgroundColor={colors.background}
          translucent={Platform.OS === 'android'}
        />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            cardStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ActivityDetails" 
            component={ActivityDetailsScreen} 
            options={({ route }) => ({ 
              title: route.params?.activityName || 'Activity Details',
              headerBackTitle: 'Back',
              animation: 'slide_from_right',
            })} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default AppNavigator;

