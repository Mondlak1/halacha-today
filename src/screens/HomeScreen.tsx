import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import { getCurrentHebrewDate } from '../services/hebrewDate';
import { getHebcalDayData, HebcalDayData } from '../services/hebcalService';
import { Ionicons } from '@expo/vector-icons';
import DailyOverview from '../components/DailyOverview';
import ZmanimDisplay from '../components/ZmanimDisplay';
import DailyActivitiesList from '../components/DailyActivitiesList';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors, borderRadius, spacing, fontSize } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [hebrewDate, setHebrewDate] = useState<any>(null);
  const [zmanim, setZmanim] = useState<HebcalDayData['zmanim'] | null>(null);

  const loadData = async () => {
    try {
      const dateData = await getCurrentHebrewDate();
      setHebrewDate(dateData);
      
      const hebcalData = await getHebcalDayData();
      setZmanim(hebcalData.zmanim);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.appLogoContainer}>
            <Ionicons name="grid" size={24} color={colors.text} /> 
            <Text style={[styles.appTitle, { color: colors.text, fontSize: fontSize.xxlarge }]}>Halacha Today</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarButton}>
              <Image source={require('../../assets/icon.png')} style={styles.avatar} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Date Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: borderRadius.large }]}>
          <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Current Date</Text>
          {hebrewDate && (
            <View>
              <Text style={[styles.mainDate, { color: colors.text, fontSize: fontSize.xxlarge }]}>
                {hebrewDate.hebrewDate}
              </Text>
              <Text style={[styles.subDate, { color: colors.textSecondary, fontSize: fontSize.large }]}>
                {hebrewDate.gregorianDate}
              </Text>
            </View>
          )}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent1 }]}
              onPress={() => navigation.navigate('Main', { screen: 'Calendar' })}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent2 }]}
              onPress={() => navigation.navigate('Main', { screen: 'Activities' })}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Activities</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent3 }]}
              onPress={() => navigation.navigate('UpcomingEvents')}
            >
              <Ionicons name="star-outline" size={24} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent1 }]}
              onPress={() => navigation.navigate('Quiz')}
            >
              <Ionicons name="help-circle-outline" size={24} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent2 }]}
              onPress={() => navigation.navigate('Main', { screen: 'Settings' })}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Overview */}
        {hebrewDate && (
          <DailyOverview
            hebrewDate={hebrewDate.hebrewDate}
            gregorianDate={hebrewDate.gregorianDate}
            parasha={hebrewDate.parasha}
            omerCount={hebrewDate.omerCount}
            isShabbat={hebrewDate.isShabbat}
            isYomTov={hebrewDate.isYomTov}
            isFastDay={hebrewDate.isFastDay}
            minorHoliday={hebrewDate.minorHoliday}
          />
        )}

        {/* Zmanim Display */}
        {zmanim && (
          <ZmanimDisplay
            candleLighting={zmanim.candleLighting}
            havdalah={zmanim.havdalah}
            shema={zmanim.shema}
            shacharit={zmanim.shacharit}
            minchaGedola={zmanim.minchaGedola}
            minchaKetana={zmanim.minchaKetana}
            location={zmanim.location}
          />
        )}

        {/* Daily Activities - adapted to card style */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: borderRadius.large }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.xlarge }]}>
              What Can I Do Today?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Main', { screen: 'Activities' })}
              style={styles.viewAllButton}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <DailyActivitiesList limit={5} showViewAll={false} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  appLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontWeight: '800', 
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0', // Light background for icon buttons
    marginLeft: 10,
  },
  avatarButton: {
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  card: {
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: '500',
    marginBottom: 10,
  },
  mainDate: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subDate: {
    fontWeight: '600',
    marginBottom: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;

