import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Holiday {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  date: string;
  hebrewDate?: string;
  imageUrl?: string;
  observances?: string[];
}

/**
 * Gets holidays for a specific date
 */
export const getHolidaysByDate = async (date: string): Promise<Holiday[]> => {
  try {
    // Format to search for: YYYY-MM-DD
    const formattedDate = date;
    
    // Get all holidays from storage
    const holidaysData = await AsyncStorage.getItem('holidaysData');
    
    if (!holidaysData) {
      return [];
    }
    
    const allHolidays = JSON.parse(holidaysData);
    
    // Filter holidays that match the date
    const matchingHolidays = allHolidays.filter(
      (holiday: any) => holiday.date === formattedDate
    );
    
    return matchingHolidays;
  } catch (error) {
    console.error('Error getting holidays by date:', error);
    return [];
  }
};

/**
 * Gets holidays between two dates
 */
export const getHolidaysBetweenDates = async (startDate: string, endDate: string): Promise<Holiday[]> => {
  try {
    // Get all holidays from storage
    const holidaysData = await AsyncStorage.getItem('holidaysData');
    
    if (!holidaysData) {
      return [];
    }
    
    const allHolidays = JSON.parse(holidaysData);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    // Filter holidays that fall between start and end dates
    const matchingHolidays = allHolidays.filter((holiday: any) => {
      const holidayDate = new Date(holiday.date).getTime();
      return holidayDate >= start && holidayDate <= end;
    });
    
    return matchingHolidays;
  } catch (error) {
    console.error('Error getting holidays between dates:', error);
    return [];
  }
};

/**
 * Gets a mapping of dates to holiday names for calendar marking
 */
export const getHolidayDatesMap = async (startDate: string, endDate: string): Promise<Record<string, string>> => {
  try {
    const holidays = await getHolidaysBetweenDates(startDate, endDate);
    const holidayMap: Record<string, string> = {};
    
    holidays.forEach(holiday => {
      // If multiple holidays on same date, use the most important one
      // This is a simplification - could be enhanced to show multiple
      holidayMap[holiday.date] = holiday.category || holiday.title;
    });
    
    return holidayMap;
  } catch (error) {
    console.error('Error creating holiday dates map:', error);
    return {};
  }
};

/**
 * Gets a specific holiday by ID
 */
export const getHolidayById = async (id: string): Promise<Holiday | null> => {
  try {
    const holidaysData = await AsyncStorage.getItem('holidaysData');
    
    if (!holidaysData) {
      return null;
    }
    
    const allHolidays = JSON.parse(holidaysData);
    const holiday = allHolidays.find((h: any) => h.id === id);
    
    return holiday || null;
  } catch (error) {
    console.error('Error getting holiday by ID:', error);
    return null;
  }
};

/**
 * Gets upcoming holidays
 */
export const getUpcomingHolidays = async (limit: number = 5): Promise<Holiday[]> => {
  try {
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    // End date is 6 months from now
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 6);
    const endDateFormatted = endDate.toISOString().split('T')[0];
    
    const holidays = await getHolidaysBetweenDates(todayFormatted, endDateFormatted);
    
    // Sort by date (closest first)
    const sortedHolidays = holidays.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Return limited number
    return sortedHolidays.slice(0, limit);
  } catch (error) {
    console.error('Error getting upcoming holidays:', error);
    return [];
  }
}; 