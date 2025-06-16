import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, DayType, ActivityStatus, CustomType, UserPreferences } from '../types/data';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import { getActivities, getCategories, getActivityStatus } from '../services/activities';
import StatusBadge from './StatusBadge';

// Define section data structure for SectionList
type ActivitySection = {
  title: string;
  data: Activity[];
};

type DailyActivitiesSummaryProps = {
  dayType: DayType;
  limit?: number;
  showGroupHeaders?: boolean;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DailyActivitiesSummary: React.FC<DailyActivitiesSummaryProps> = ({ 
  dayType, 
  limit = 5,
  showGroupHeaders = true
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, spacing } = useTheme();
  const [activitySections, setActivitySections] = useState<ActivitySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [userTradition, setUserTradition] = useState<CustomType>('Ashkenazi');

  // Load user preferences to get tradition setting
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const prefsJson = await AsyncStorage.getItem('user_preferences');
        if (prefsJson) {
          const prefs = JSON.parse(prefsJson) as UserPreferences;
          setUserTradition(prefs.custom);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        // Fall back to default Ashkenazi
      }
    };

    loadUserPreferences();
  }, []);

  // Load and organize activities by category
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        // Get all activities and categories
        const allActivities = await getActivities();
        const categories = await getCategories();
        
        // Group activities by category
        const sections: ActivitySection[] = [];
        
        // For each category, get the activities
        for (const category of categories) {
          const categoryActivities = allActivities
            .filter(activity => activity.category === category)
            .sort((a, b) => {
              const nameA = a.name || '';
              const nameB = b.name || '';
              return nameA.localeCompare(nameB);
            });
          
          // If there are activities in this category, add it as a section
          if (categoryActivities.length > 0) {
            sections.push({
              title: category,
              data: categoryActivities,
            });
          }
        }
        
        // Apply limit if specified, distributing across categories
        if (limit > 0 && limit < allActivities.length) {
          // Simple approach: take top N from each category
          const limitPerSection = Math.max(1, Math.floor(limit / sections.length));
          const limitedSections = sections.map(section => ({
            ...section,
            data: section.data.slice(0, limitPerSection)
          }));
          setActivitySections(limitedSections);
        } else {
          setActivitySections(sections);
        }
      } catch (error) {
        console.error('Error loading activities:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [limit, userTradition]);

  // Get activity status with tradition preference
  const getActivityStatusWithTradition = (activity: Activity): ActivityStatus => {
    return getActivityStatus(activity, dayType as keyof Activity['statusByDay'], userTradition);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const status = getActivityStatusWithTradition(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.activityItem, 
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            marginBottom: spacing.s 
          }
        ]}
        onPress={() => navigation.navigate('ActivityDetail', {
          activityId: item.id,
          activityName: item.name,
          dayType,
          tradition: userTradition
        })}
      >
        <View style={styles.activityContent}>
          <Text style={[styles.activityName, { color: colors.text }]}>
            {item.name}
          </Text>
          <StatusBadge status={status} size="small" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: ActivitySection }) => {
    if (!showGroupHeaders) return null;
    
    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
          {section.title}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading activities...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Could not load activities. Please try again.
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsLoading(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (activitySections.length === 0 || activitySections.every(section => section.data.length === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: colors.text }}>No activities found for today.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={activitySections}
        renderItem={renderActivityItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
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
    fontSize: 14,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityItem: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});

export default DailyActivitiesSummary;
