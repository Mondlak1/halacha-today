import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getCurrentHebrewDate } from '../services/hebrewDate';
import { importHolidayData, preloadHolidayImages } from '../services/aiService';
import JewishLoadingSpinner from '../components/JewishLoadingSpinner';

// Define a simple date interface for our app
interface DateData {
  dateString: string;
  day: number;
  month: number;
  year: number;
}

// Define a simplified holiday interface 
interface Holiday {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  date: string;
}

const CalendarScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [hebrewDate, setHebrewDate] = useState<string>('');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const calendarAnim = useRef(new Animated.Value(0)).current;

  // Load data on component mount
  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  // Animations setup
  const startAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    calendarAnim.setValue(0);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(calendarAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.elastic(1)),
      }),
    ]).start();
  };

  // Main data loading function
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Set current date
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
      
      // Get Hebrew date
      const hebrewDateInfo = getCurrentHebrewDate();
      setHebrewDate(hebrewDateInfo.hebrewDateString || '');
      
      // Get holidays for current date (simplified - in a real app this would use holidayService)
      // Since we're having issues with the holidayService import, let's use a placeholder
      setHolidays(getDummyHolidaysForDate(formattedDate));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  // Placeholder function to get dummy holidays for a date
  const getDummyHolidaysForDate = (date: string): Holiday[] => {
    // This is just a placeholder - in a real app this would call the holidayService
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Return some sample data for demonstration
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      return [{
        id: 'shabbat',
        title: 'Shabbat',
        description: 'The weekly day of rest',
        category: 'Shabbat',
        date: date
      }];
    }
    
    // Random holiday every 7 days
    if (today.getDate() % 7 === 0) {
      return [{
        id: 'sample-holiday',
        title: 'Sample Jewish Holiday',
        description: 'A placeholder for demonstration purposes',
        category: 'Yom Tov',
        date: date
      }];
    }
    
    return [];
  };

  // Handle date selection
  const handleDateSelect = (date: DateData) => {
    try {
      const selectedDateStr = date.dateString;
      setSelectedDate(selectedDateStr);
      
      // Get holidays for selected date
      setHolidays(getDummyHolidaysForDate(selectedDateStr));
    } catch (error) {
      console.error('Error handling date selection:', error);
    }
  };

  // Handle holiday data import
  const handleImportData = async () => {
    try {
      setIsImporting(true);
      setImportStatus('Starting import...');
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Import holiday data for current and next year
      setImportStatus('Importing holiday data...');
      await importHolidayData(currentYear);
      await importHolidayData(currentYear + 1);
      
      // Preload holiday images
      setImportStatus('Preloading images...');
      await preloadHolidayImages();
      
      // Update UI with success
      setImportStatus('Import completed!');
      
      // Reload data
      await loadData();
      
      // Reset status after delay
      setTimeout(() => {
        setImportStatus(null);
        setIsImporting(false);
      }, 1500);
    } catch (error) {
      console.error('Error importing data:', error);
      setImportStatus('Import failed');
      
      // Reset status after delay
      setTimeout(() => {
        setImportStatus(null);
        setIsImporting(false);
      }, 2000);
    }
  };

  // Get color for a holiday type
  const getHolidayColor = (categoryName: string): string => {
    if (categoryName.includes('Shabbat')) {
      return colors.shabbat;
    } else if (categoryName.includes('Rosh Chodesh')) {
      return colors.roshChodesh;
    } else if (categoryName.includes('Fast')) {
      return colors.fastDay;
    } else {
      return colors.yomTov;
    }
  };

  // Render a holiday item
  const renderHolidayItem = (holiday: Holiday, index: number) => {
    return (
      <Animated.View
        key={`${holiday.title}-${index}`}
        style={[
          styles.holidayItem,
          { 
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, 1.2 + (index * 0.2)) }]
          }
        ]}
      >
        <View style={styles.holidayDetails}>
          <Text style={[styles.holidayTitle, { color: colors.text }]}>
            {holiday.title}
          </Text>
          
          {holiday.subtitle && (
            <Text style={[styles.holidaySubtitle, { color: colors.secondary }]}>
              {holiday.subtitle}
            </Text>
          )}
          
          {holiday.description && (
            <Text style={[styles.holidayDescription, { color: colors.secondary }]}>
              {holiday.description}
            </Text>
          )}
        </View>
        
        {holiday.category && (
          <View 
            style={[
              styles.categoryBadge,
              { backgroundColor: getHolidayColor(holiday.category) + '20' }
            ]}
          >
            <Text style={[styles.categoryText, { color: getHolidayColor(holiday.category) }]}>
              {holiday.category}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  // Render a simple calendar
  const renderSimpleCalendar = () => {
    const today = new Date();
    
    return (
      <View style={styles.simpleCalendar}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity 
          style={[styles.dateButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => {
            const today = new Date();
            handleDateSelect({
              dateString: today.toISOString().split('T')[0],
              day: today.getDate(),
              month: today.getMonth() + 1,
              year: today.getFullYear()
            });
          }}
        >
          <Text style={[styles.dateButtonText, { color: colors.primary }]}>
            Select Current Date
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Show loading spinner if data is loading
  if (isLoading || isImporting) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <JewishLoadingSpinner size={40} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondary }]}>
          {isImporting && importStatus ? importStatus : 'Loading calendar data...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.calendarContainer,
          { 
            backgroundColor: colors.card,
            opacity: calendarAnim,
            transform: [{ scale: calendarAnim }]
          }
        ]}
      >
        {renderSimpleCalendar()}
      </Animated.View>

      <Animated.View
        style={[
          styles.dateInfoContainer,
          { 
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.dateInfo}>
          <Text style={[styles.hebrewDateTitle, { color: colors.secondary }]}>
            Hebrew Date
          </Text>
          <Text style={[styles.hebrewDateText, { color: colors.text }]}>
            {hebrewDate || 'Loading...'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: colors.primary + '15' }]}
          onPress={handleImportData}
          disabled={isImporting}
        >
          {isImporting ? (
            <JewishLoadingSpinner size={18} color={colors.primary} />
          ) : (
            <Ionicons name="refresh" size={18} color={colors.primary} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {importStatus && (
        <Animated.View
          style={[
            styles.importStatusContainer,
            { 
              backgroundColor: colors.card,
              opacity: fadeAnim 
            }
          ]}
        >
          {isImporting ? (
            <JewishLoadingSpinner size={20} color={colors.primary} />
          ) : (
            <Ionicons
              name={importStatus.includes('completed') ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={importStatus.includes('completed') ? colors.allowed : colors.conditional}
            />
          )}
          <Text
            style={[
              styles.importStatusText,
              { color: importStatus.includes('completed') ? colors.allowed : colors.conditional }
            ]}
          >
            {importStatus}
          </Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.holidaysContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {holidays.length > 0
            ? `Holidays on ${new Date(selectedDate).toLocaleDateString()}`
            : `No holidays on ${new Date(selectedDate).toLocaleDateString()}`}
        </Text>
        
        {holidays.length > 0 ? (
          holidays.map((holiday, index) => renderHolidayItem(holiday, index))
        ) : (
          <Animated.View
            style={[
              styles.noHolidaysContainer,
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Ionicons name="calendar-outline" size={32} color={colors.secondary} />
            <Text style={[styles.noHolidaysText, { color: colors.secondary }]}>
              No Jewish holidays on this date
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </ScrollView>
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
    marginBottom: 24,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hebrewDateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  calendarContainer: {
    marginBottom: 24,
    borderRadius: 12,
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  calendarDayText: {
    fontSize: 16,
  },
  selectedDay: {
    backgroundColor: '#f0f0f0',
  },
  today: {
    borderWidth: 2,
  },
  holidaysContainer: {
    marginTop: 24,
  },
  holidaysTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  holidayItem: {
    marginBottom: 16,
    borderRadius: 12,
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
  holidayDetails: {
    padding: 16,
  },
  holidayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  holidaySubtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  holidayDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
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
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  importStatus: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
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
  dateInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dateInfo: {
    flex: 1,
  },
  hebrewDateTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  refreshButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  importStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noHolidaysContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  noHolidaysText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  simpleCalendar: {
    padding: 20,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CalendarScreen;
