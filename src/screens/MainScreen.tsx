import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

// Import screens
import HomeScreen from './HomeScreen';
import ActivityListScreen from './ActivityListScreen';
import CalendarScreen from './CalendarScreen';
import SettingsScreen from './SettingsScreen';
import WhatCanIDoScreen from './WhatCanIDoScreen';
import ZmanimScreen from './ZmanimScreen'; // Assuming you'll create this later

import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainScreen = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: 80, // Adjust height as per Trantor design
          paddingBottom: 20, // Adjust padding as per Trantor design
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Zmanim') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'Activities') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'WhatCanIDo') iconName = focused ? 'help-circle' : 'help-circle-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activities" component={ActivityListScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="WhatCanIDo" component={WhatCanIDoScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      {/* Assuming ZmanimScreen will be created for dedicated Zmanim view */}
      <Tab.Screen name="Zmanim" component={ZmanimScreen} /> 
    </Tab.Navigator>
  );
};

export default MainScreen; 