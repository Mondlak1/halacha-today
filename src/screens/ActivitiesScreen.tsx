import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getActivitiesByCategorySync } from '../services/activities';
import { RootStackParamList, MainTabParamList } from '../types/navigation';
import { Activity } from '../types/data';

type ActivitiesScreenRouteProp = RouteProp<MainTabParamList, 'Activities'>;
type ActivitiesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ActivitiesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<ActivitiesScreenNavigationProp>();
  const route = useRoute<ActivitiesScreenRouteProp>();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    route.params?.category
  );
  
  // Available categories
  const categories = [
    'All',
    'Food & Kashrut',
    'Shabbat & Holidays',
    'Prayer',
    'Family Life',
    'Business & Work',
    'Daily Living'
  ];
  
  useEffect(() => {
    loadActivities();
  }, [selectedCategory]);
  
  const loadActivities = () => {
    setLoading(true);
    
    // Get activities from service - use synchronous version
    const allActivities = getActivitiesByCategorySync(
      selectedCategory !== 'All' && selectedCategory ? selectedCategory : ''
    );
    
    setActivities(allActivities);
    setLoading(false);
  };
  
  const handleActivityPress = (activity: Activity) => {
    navigation.navigate('ActivityDetails', { activityId: activity.id });
  };
  
  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item || (item === 'All' && !selectedCategory)
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={() => setSelectedCategory(item === 'All' ? undefined : item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item || (item === 'All' && !selectedCategory)
            ? { color: 'white' } // Use white for text on primary background
            : { color: colors.text }
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );
  
  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={[styles.activityItem, { backgroundColor: colors.card }]}
      onPress={() => handleActivityPress(item)}
    >
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text 
          style={[styles.activityDescription, { color: colors.secondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={styles.categoryTag}>
          <Text style={[styles.categoryTagText, { color: colors.primary }]}>
            {item.category}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.primary} />
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Categories Horizontal List */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
      />
      
      {/* Activities List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.activitiesContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesList: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activitiesContent: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  activityDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  categoryTag: {
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ActivitiesScreen; 