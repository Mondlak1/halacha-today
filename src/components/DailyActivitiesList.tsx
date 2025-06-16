import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { Activity, DayType, CustomType, UserPreferences } from '../types/data';
import { useTheme } from '../hooks/useTheme';
import { getActivities, getActivityStatus } from '../services/activities';
import { getCurrentHebrewDate } from '../services/hebrewDate';
import StatusBadge from './StatusBadge';

type DailyActivitiesNavigationProp = StackNavigationProp<RootStackParamList>;

interface DailyActivitiesListProps {
  limit?: number;
  showViewAll?: boolean;
  filter?: (activity: Activity) => boolean;
}

const DailyActivitiesList = ({
  limit,
  showViewAll = true,
  filter,
}: DailyActivitiesListProps) => {
  const navigation = useNavigation<DailyActivitiesNavigationProp>();
  const { colors } = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentDayType, setCurrentDayType] = useState<DayType>('regular');
  const [userTradition, setUserTradition] = useState<CustomType>('Ashkenazi');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listItemAnimations = useRef<Animated.Value[]>([]).current;

  // Load activities and user preferences
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load user preferences
        const prefsJson = await AsyncStorage.getItem('user_preferences');
        if (prefsJson) {
          const prefs = JSON.parse(prefsJson) as UserPreferences;
          setUserTradition(prefs.custom);
        }
        
        // Get current Hebrew date and day type
        const hebrewDate = getCurrentHebrewDate();
        setCurrentDayType(hebrewDate.dayType);
        
        // Load all activities
        const allActivities = await getActivities();
        
        // Sort activities by status for the current day
        const sortedActivities = allActivities.sort((a, b) => {
          const statusA = getActivityStatus(a, currentDayType, userTradition);
          const statusB = getActivityStatus(b, currentDayType, userTradition);
          
          // Put allowed first, then conditional, then forbidden
          if (statusA === 'allowed' && statusB !== 'allowed') return -1;
          if (statusB === 'allowed' && statusA !== 'allowed') return 1;
          if (statusA === 'conditional' && statusB === 'forbidden') return -1;
          if (statusB === 'conditional' && statusA === 'forbidden') return 1;
          
          // If same status, sort alphabetically, with null check
          const titleA = a.title || '';
          const titleB = b.title || '';
          return titleA.localeCompare(titleB);
        });
        
        // Apply custom filter if provided
        const filteredActivities = filter 
          ? sortedActivities.filter(filter)
          : sortedActivities;
          
        // Initialize animations for each item
        listItemAnimations.length = 0;
        filteredActivities.forEach((_, index) => {
          listItemAnimations.push(new Animated.Value(0));
        });
        
        setActivities(filteredActivities);
        setIsLoading(false);
        
        // Start animations
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }).start();
        
        // Staggered animations for list items
        listItemAnimations.forEach((anim, index) => {
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: 100 + (index * 70),
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          }).start();
        });
      } catch (error) {
        console.error('Error loading activities:', error);
        setIsError(true);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle navigation to activity details
  const handleActivityPress = (activity: Activity) => {
    navigation.navigate('ActivityDetails', {
      activityId: activity.id,
      activityName: activity.title,
      dayType: currentDayType,
      tradition: userTradition
    });
  };

  // Navigate to activities list
  const handleViewAllPress = () => {
    navigation.navigate('Main', { screen: 'Activities' });
  };

  // Render an activity item
  const renderActivityItem = ({ item, index }: { item: Activity; index: number }) => {
    // Safely handle undefined status
    const status = item.statusByDay?.['regular'] || 'allowed';
    const statusColor = colors[status] || colors.text;
    
    return (
      <Animated.View
        style={[
          styles.activityItem,
          { 
            backgroundColor: colors.card,
            opacity: listItemAnimations[index],
            transform: [{
              translateY: listItemAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.activityContent}
          onPress={() => handleActivityPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <StatusBadge status={status} size="small" />
          </View>
          
          <Text 
            style={[styles.activityDescription, { color: statusColor }]}
            numberOfLines={2}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
          
          <View style={styles.activityFooter}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {item.category}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.moreButton} onPress={() => handleActivityPress(item)}>
              <Text style={[styles.moreButtonText, { color: colors.primary }]}>Details</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondary }]}>
          Loading activities...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load activities
        </Text>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <Animated.View 
        style={[
          styles.emptyContainer, 
          { 
            backgroundColor: colors.background,
            opacity: fadeAnim 
          }
        ]}
      >
        <Ionicons name="calendar-outline" size={32} color={colors.secondary} />
        <Text style={[styles.emptyText, { color: colors.secondary }]}>
          No activities found
        </Text>
      </Animated.View>
    );
  }

  // Apply limit if specified
  const displayedActivities = limit ? activities.slice(0, limit) : activities;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Activities for {currentDayType === 'regular' ? 'Today' : currentDayType}
        </Text>
        
        {limit && activities.length > limit && showViewAll && (
          <TouchableOpacity
            style={[styles.showAllButton, { borderColor: colors.primary }]}
            onPress={handleViewAllPress}
          >
            <Text style={[styles.showAllText, { color: colors.primary }]}>
              Show all ({activities.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={displayedActivities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  activityItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  activityDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 8,
  },
});

export default DailyActivitiesList; 