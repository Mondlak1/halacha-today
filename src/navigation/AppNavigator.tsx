import React, { useEffect, useRef } from 'react';
import { NavigationContainer, LinkingOptions, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StatusBar, useColorScheme, SafeAreaView } from 'react-native';
import * as Notifications from 'expo-notifications';

// Import screens
import ActivityDetailsScreen from '../screens/ActivityDetailsScreen';
import GoogleSignInScreen from '../screens/GoogleSignInScreen';
import MainScreen from '../screens/MainScreen';

// Import types
import { RootStackParamList, MainTabParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import { 
  setupNotificationListener, 
  setupNotificationResponseListener 
} from '../services/notifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Define linking configuration for deep links and notifications
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['halachatoday://', 'https://halachatoday.app'],
  config: {
    screens: {
      GoogleSignIn: 'signin',
      Main: {
        path: 'main',
        screens: {
          Home: 'home',
          Activities: 'activities',
          Calendar: 'calendar',
          WhatCanIDo: 'whatcanido',
          Settings: 'settings',
          Zmanim: 'zmanim',
        } as Record<keyof MainTabParamList, string>,
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
          initialRouteName="GoogleSignIn"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen
            name="GoogleSignIn"
            component={GoogleSignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ActivityDetail"
            component={ActivityDetailsScreen}
            options={({ route }: { route: any }) => ({ title: route.params?.activityName || 'Activity Details' })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default AppNavigator;

