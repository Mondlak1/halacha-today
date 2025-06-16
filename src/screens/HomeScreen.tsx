import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import { getCurrentHebrewDate, getEnhancedDayInfo } from '../services/hebrewDate';
import { JewishDate, Activity } from '../types/data';
import DailyActivitiesList from '../components/DailyActivitiesList';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '../components/ThemeToggle';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [hebrewDate, setHebrewDate] = useState<JewishDate | null>(null);
  const [dayInfo, setDayInfo] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Initialize data and start animations
  useEffect(() => {
    loadData();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
    
    // Set up timer to update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timeInterval);
  }, []);

  const loadData = async () => {
    try {
      // Get current Hebrew date
      const date = getCurrentHebrewDate();
      setHebrewDate(date);
      
      // Get enhanced day info if it's a special day
      if (date.specialDay) {
        const info = await getEnhancedDayInfo();
        setDayInfo(info);
      } else {
        setDayInfo(null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Navigate to calendar
  const navigateToCalendar = () => {
    navigation.navigate('Main', { screen: 'Calendar' });
  };

  // Navigate to activities
  const navigateToActivities = () => {
    navigation.navigate('Main', { screen: 'Activities' });
  };

  // Filter for activities appropriate for the current day
  const activityFilter = (activity: Activity) => {
    if (!hebrewDate) return true;
    const status = activity.statusByDay?.[hebrewDate.dayType];
    return status !== 'forbidden';
  };
  
  // Format current time
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.headerSection, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Shalom!
          </Text>
          
          <Text style={[styles.currentTime, { color: colors.secondary }]}>
            {formatCurrentTime()}
          </Text>
          
          {hebrewDate && (
            <View style={styles.dateContainer}>
              <Text style={[styles.dateText, { color: colors.primary }]}>
                {hebrewDate.hebrewDateString}
              </Text>
              
              {hebrewDate.specialDay && (
                <Text style={[styles.specialDayText, { color: colors.primary }]}>
                  {hebrewDate.specialDay}
                </Text>
              )}
            </View>
          )}
        </Animated.View>
        
        {/* Quick Action Buttons */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.card }]}
            onPress={navigateToCalendar}
          >
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Calendar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.card }]}
            onPress={navigateToActivities}
          >
            <Ionicons name="list" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Activities
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Special Day Information */}
        {hebrewDate?.specialDay && dayInfo && (
          <Animated.View 
            style={[
              styles.infoCard, 
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}] 
              }
            ]}
          >
            <Text style={[styles.infoCardTitle, { color: colors.primary }]}>
              About {hebrewDate.specialDay}
            </Text>
            <Text style={[styles.infoCardText, { color: colors.text }]}>
              {dayInfo}
            </Text>
          </Animated.View>
        )}
        
        {/* Shabbat Times if today is Friday or it's already Shabbat */}
        {hebrewDate?.candles && (
          <Animated.View 
            style={[
              styles.card, 
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}] 
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="flame" size={24} color={colors.warning} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Shabbat Times
              </Text>
            </View>
            
            <View style={styles.shabbatTimesContainer}>
              {hebrewDate.candles.lighting && (
                <View style={styles.timeItem}>
                  <Text style={[styles.timeLabel, { color: colors.secondary }]}>
                    Candle Lighting:
                  </Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>
                    {hebrewDate.candles.lighting}
                  </Text>
                </View>
              )}
              
              {hebrewDate.candles.havdalah && (
                <View style={styles.timeItem}>
                  <Text style={[styles.timeLabel, { color: colors.secondary }]}>
                    Havdalah:
                  </Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>
                    {hebrewDate.candles.havdalah}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
        
        {/* Daf Yomi section */}
        {hebrewDate?.dafYomi && (
          <Animated.View 
            style={[
              styles.card, 
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}] 
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="book" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Daf Yomi
              </Text>
            </View>
            
            <Text style={[styles.dafYomiText, { color: colors.text }]}>
              {hebrewDate.dafYomi}
            </Text>
          </Animated.View>
        )}
        
        {/* Appropriate Activities for Today */}
        <View style={styles.activitiesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Activities for Today
          </Text>
          
          <DailyActivitiesList 
            limit={5} 
            showViewAll={true}
            filter={activityFilter}
          />
        </View>

        <View style={styles.headerActions}>
          <ThemeToggle />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  currentTime: {
    fontSize: 18,
    marginBottom: 16,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  specialDayText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  quickActionButton: {
    width: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shabbatTimesContainer: {
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dafYomiText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  activitiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
});

export default HomeScreen;

