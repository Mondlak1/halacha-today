import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, SectionList, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, MainTabParamList } from '../types/navigation';
import { Activity, DayType, CustomType, UserPreferences } from '../types/data';
import { useTheme } from '../hooks/useTheme';
import { getActivities, getCategories, getActivityStatus } from '../services/activities';
import { getCurrentHebrewDate } from '../services/hebrewDate';
import StatusBadge from '../components/StatusBadge';
import { BlurView } from 'expo-blur';

type ActivityListScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type ActivityListScreenRouteProp = RouteProp<MainTabParamList, 'Activities'>;

// Section data structure for SectionList
interface ActivitySection {
  title: string;
  data: Activity[];
}

const ActivityListScreen = () => {
  const navigation = useNavigation<ActivityListScreenNavigationProp>();
  const route = useRoute<ActivityListScreenRouteProp>();
  const { colors } = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [sections, setSections] = useState<ActivitySection[]>([]);
  const [currentDayType, setCurrentDayType] = useState<DayType>('regular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    route.params?.category || null
  );
  const [userTradition, setUserTradition] = useState<CustomType>('Ashkenazi');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Initialize user preferences and load activities
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load user preferences for tradition
        const prefsJson = await AsyncStorage.getItem('user_preferences');
        if (prefsJson) {
          const prefs = JSON.parse(prefsJson) as UserPreferences;
          setUserTradition(prefs.custom);
        }
        
        // Load activities and categories
        await loadActivitiesAndCategories();
      } catch (error) {
        console.error('Error initializing data:', error);
        setIsError(true);
      }
    };

    initializeData();
  }, []);

  // Load activities and categories
  const loadActivitiesAndCategories = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Get the current day type from Hebrew date service
      const hebrewDate = getCurrentHebrewDate();
      setCurrentDayType(hebrewDate.dayType);
      
      // Get all activities
      const allActivities = await getActivities();
      setActivities(allActivities);
      
      // Get all categories
      const allCategories = await getCategories();
      setCategories(allCategories);
      
      // Set initial filtered activities
      if (route.params?.category) {
        // If a category was passed in navigation params, filter by it
        const categoryFiltered = allActivities.filter(
          activity => activity.category === route.params.category
        );
        setFilteredActivities(categoryFiltered);
      } else {
        // Otherwise show all activities
        setFilteredActivities(allActivities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter activities whenever search query or category changes
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...activities];
      
      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          activity => 
            activity.title.toLowerCase().includes(query) || 
            activity.category.toLowerCase().includes(query)
        );
      }
      
      // Filter by category
      if (selectedCategory) {
        filtered = filtered.filter(
          activity => activity.category === selectedCategory
        );
      }
      
      setFilteredActivities(filtered);
    };
    
    applyFilters();
  }, [searchQuery, selectedCategory, activities]);

  // Group activities by category for SectionList
  useEffect(() => {
    const groupActivitiesByCategory = () => {
      // Create a map of categories to activities
      const categoryMap: Record<string, Activity[]> = {};
      
      filteredActivities.forEach(activity => {
        if (!categoryMap[activity.category]) {
          categoryMap[activity.category] = [];
        }
        categoryMap[activity.category].push(activity);
      });
      
      // Convert map to sections array
      const sectionArray: ActivitySection[] = Object.keys(categoryMap)
        .sort()
        .map(category => ({
          title: category,
          data: categoryMap[category].sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleA.localeCompare(titleB);
          }),
        }));
      
      setSections(sectionArray);
    };
    
    groupActivitiesByCategory();
  }, [filteredActivities]);

  // Handle search query change
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Render category filter chips
  const renderCategoryFilters = () => {
    return (
      <View style={styles.categoryFiltersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFiltersContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && {
                backgroundColor: colors.primary + '20',
                borderColor: colors.primary,
              },
              { borderColor: colors.border },
            ]}
            onPress={() => handleCategorySelect(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: !selectedCategory ? colors.primary : colors.text },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                },
                { borderColor: colors.border },
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === category ? colors.primary : colors.text },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render an activity item
  const renderActivityItem = ({ item }: { item: Activity }) => {
    const status = getActivityStatus(
      item,
      currentDayType as keyof Activity['statusByDay'],
      userTradition
    );
    
    return (
      <TouchableOpacity
        style={[
          styles.activityItem,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={() => navigation.navigate('ActivityDetails', {
          activityId: item.id,
          activityName: item.title,
          dayType: currentDayType,
          tradition: userTradition
        })}
      >
        <View style={styles.activityContent}>
          <Text style={[styles.activityName, { color: colors.text }]}>
            {item.title}
          </Text>
          <StatusBadge status={status} size="small" />
        </View>
      </TouchableOpacity>
    );
  };

  // Render a section header
  const renderSectionHeader = ({ section }: { section: ActivitySection }) => {
    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
          {section.title}
        </Text>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading activities...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Could not load activities.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadActivitiesAndCategories}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search bar and filters in a BlurView card */}
        <BlurView intensity={50} tint="light" style={styles.glassCard}>
          <View style={styles.header}>
            <Text style={[styles.screenTitle, { color: colors.text }]}>Activities</Text>
            <Text style={[styles.dayTypeLabel, { color: colors.textSecondary }]}>Showing for: {currentDayType.charAt(0).toUpperCase() + currentDayType.slice(1)}</Text>
          </View>
          <View style={[styles.searchContainer, { backgroundColor: 'transparent', borderColor: colors.border }]}> 
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search activities..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          {renderCategoryFilters()}
        </BlurView>
        {/* Activities list in a BlurView card */}
        <BlurView intensity={40} tint="light" style={styles.glassCard}>
          {filteredActivities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No activities match your search.</Text>
            </View>
          ) : (
            <SectionList
              sections={sections}
              renderItem={renderActivityItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={true}
            />
          )}
        </BlurView>
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
    padding: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dayTypeLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  categoryFiltersContainer: {
    marginBottom: 16,
  },
  categoryFiltersContent: {
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
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
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityItem: {
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
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
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  glassCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default ActivityListScreen;
