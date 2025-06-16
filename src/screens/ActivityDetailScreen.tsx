import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { Activity, DayType, ActivityStatus, CustomType, UserPreferences } from '../types/data';
import { useTheme } from '../hooks/useTheme';
import { getActivityById, getActivityStatus } from '../services/activities';
import { getCurrentHebrewDate } from '../services/hebrewDate';
import StatusBadge from '../components/StatusBadge';

type ActivityDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ActivityDetail'>;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ActivityDetailScreen: React.FC<ActivityDetailScreenProps> = ({ route }) => {
  const { activityId, dayType: routeDayType, tradition: routeTradition } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { colors, spacing } = useTheme();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [currentDayType, setCurrentDayType] = useState<DayType>(routeDayType || 'regular');
  const [userTradition, setUserTradition] = useState<CustomType>(routeTradition || 'Ashkenazi');
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>('allowed');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [relatedActivities, setRelatedActivities] = useState<Activity[]>([]);

  // Load user preferences if not provided in route params
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!routeTradition) {
        try {
          const prefsJson = await AsyncStorage.getItem('user_preferences');
          if (prefsJson) {
            const prefs = JSON.parse(prefsJson) as UserPreferences;
            setUserTradition(prefs.custom);
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
          // Fall back to default Ashkenazi (already set in state)
        }
      }
    };

    loadUserPreferences();
  }, [routeTradition]);

  // Determine current day type if not provided in route params
  useEffect(() => {
    const determineCurrentDay = () => {
      if (!routeDayType) {
        try {
          const hebrewDate = getCurrentHebrewDate();
          setCurrentDayType(hebrewDate.dayType);
        } catch (error) {
          console.error('Error determining day type:', error);
          // Fall back to regular (already set in state)
        }
      }
    };

    determineCurrentDay();
  }, [routeDayType]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        // Load activity data
        const activityData = await getActivityById(activityId);
        if (activityData) {
          setActivity(activityData);
          
          // Determine activity status based on day type and tradition
          const status = getActivityStatus(
            activityData, 
            currentDayType as keyof Activity['statusByDay'], 
            userTradition
          );
          setActivityStatus(status);
          
          // Load related activities if any
          if (activityData.relatedActivities && activityData.relatedActivities.length > 0) {
            const relatedData: Activity[] = [];
            for (const relatedId of activityData.relatedActivities) {
              const related = await getActivityById(relatedId);
              if (related) {
                relatedData.push(related);
              }
            }
            setRelatedActivities(relatedData);
          }
        } else {
          setIsError(true);
          setErrorMessage('Activity not found');
        }
      } catch (error) {
        console.error('Error loading activity details:', error);
        setIsError(true);
        setErrorMessage('Failed to load activity details');
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data when we have both day type and tradition
    if (currentDayType && userTradition) {
      loadData();
    }
  }, [activityId, currentDayType, userTradition]);

  // Get explanation based on day type and tradition
  const getExplanation = () => {
    if (!activity) return '';
    
    // Check if there's a custom explanation for this tradition
    if (activity.customVariation[userTradition.toLowerCase() as keyof typeof activity.customVariation]) {
      const customVariation = activity.customVariation[userTradition.toLowerCase() as keyof typeof activity.customVariation];
      if (customVariation?.explanation && customVariation.explanation[currentDayType]) {
        return customVariation.explanation[currentDayType];
      }
    }
    
    // Fall back to standard explanation
    return activity.explanation[currentDayType] || activity.explanation.regular;
  };
  
  const handleRelatedActivityPress = (relatedId: string, name: string) => {
    navigation.push('ActivityDetail', {
      activityId: relatedId,
      activityName: name,
      dayType: currentDayType,
      tradition: userTradition
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading activity details...
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
            {errorMessage || 'An error occurred'}
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
  
  if (!activity) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Activity not found
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.activityName, { color: colors.text }]}>
            {activity.name}
          </Text>
          <View style={styles.categoryContainer}>
            <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
              Category:
            </Text>
            <Text style={[styles.categoryValue, { color: colors.text }]}>
              {activity.category}
            </Text>
          </View>
        </View>
        
        {/* Status Section */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Status for {currentDayType.charAt(0).toUpperCase() + currentDayType.slice(1)}
          </Text>
          <View style={styles.statusContainer}>
            <StatusBadge status={activityStatus} showLabel size="large" />
            <Text style={[styles.traditionText, { color: colors.textSecondary }]}>
              According to {userTradition} tradition
            </Text>
          </View>
        </View>
        
        {/* Explanation Section */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Explanation
          </Text>
          <Text style={[styles.explanationText, { color: colors.text }]}>
            {getExplanation()}
          </Text>
        </View>
        
        {/* Sources Section */}
        {activity.sources && activity.sources.length > 0 && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Sources
            </Text>
            {activity.sources.map((source, index) => (
              <View key={index} style={styles.sourceItem}>
                <Text style={[styles.sourceText, { color: colors.text }]}>
                  {source.text}
                </Text>
                <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
                  {source.reference}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Related Activities Section */}
        {relatedActivities.length > 0 && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Related Activities
            </Text>
            {relatedActivities.map((related) => (
              <TouchableOpacity
                key={related.id}
                style={[styles.relatedItem, { backgroundColor: colors.card }]}
                onPress={() => handleRelatedActivityPress(related.id, related.name)}
              >
                <Text style={[styles.relatedName, { color: colors.text }]}>
                  {related.name}
                </Text>
                <StatusBadge 
                  status={getActivityStatus(
                    related, 
                    currentDayType as keyof Activity['statusByDay'], 
                    userTradition
                  )} 
                  size="small" 
                  showLabel={false}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Tradition Variation Section - show if different traditions have different rules */}
        {activity.customVariation && 
         Object.keys(activity.customVariation).length > 0 && 
         Object.keys(activity.customVariation).some(key => 
           key.toLowerCase() !== userTradition.toLowerCase() && 
           activity.customVariation[key as keyof typeof activity.customVariation]?.explanation
         ) && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Other Traditions
            </Text>
            {Object.keys(activity.customVariation).map((tradition) => {
              // Skip current tradition
              if (tradition.toLowerCase() === userTradition.toLowerCase()) return null;
              
              const customVariation = activity.customVariation[tradition as keyof typeof activity.customVariation];
              if (!customVariation?.explanation || !customVariation.explanation[currentDayType]) return null;
              
              return (
                <View key={tradition} style={styles.traditionVariation}>
                  <Text style={[styles.traditionName, { color: colors.text }]}>
                    {tradition.charAt(0).toUpperCase() + tradition.slice(1)} Tradition:
                  </Text>
                  <Text style={[styles.traditionExplanation, { color: colors.textSecondary }]}>
                    {customVariation.explanation[currentDayType]}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
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
  header: {
    marginBottom: 20,
  },
  activityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    alignItems: 'center',
  },
  traditionText: {
    marginTop: 8,
    fontSize: 14,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  sourceItem: {
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  referenceText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  relatedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedName: {
    fontSize: 16,
    flex: 1,
  },
  traditionVariation: {
    marginBottom: 12,
  },
  traditionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  traditionExplanation: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ActivityDetailScreen;
