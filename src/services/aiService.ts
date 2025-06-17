import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, JewishDate, DayType } from '../types/data';
import { getCurrentHebrewDate, getJewishDayDescription } from './hebrewDate';
import { ACTIVITIES } from './activities';

// Storage keys
const AI_HOLIDAY_INFO_KEY = 'ai_holiday_info';
const AI_ACTIVITIES_INFO_KEY = 'ai_activities_info';
const IMPORT_LAST_CHECK_KEY = 'import_last_check';

// Demo API key - replace with your actual API key in production
// This is just for demonstration and won't work for real API calls
const API_KEY = 'demo-api-key-replace-in-production';
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Flag to indicate if we're running in demo mode (use fallback data instead of API calls)
const USE_DEMO_MODE = true;

// Centralized API Configuration
const API_BASE_URL = 'https://your-api-endpoint.com/api'; // Replace with your actual API endpoint
const API_TIMEOUT = 15000; // 15 seconds timeout

// Type Definitions (Centralized)
interface HolidayInfo {
  name: string;
  description: string;
  traditions: string[];
  laws: string[];
  modernPractices: string[];
  historicalContext: string;
  lastUpdated: number; // timestamp
}

// Ensure ActivityInfo is defined only once and includes all fields
interface ActivityInfo {
  activityId: string; // Added missing field
  detailedDescription: string;
  practicalTips: string[];
  commonQuestions: Array<{
    question: string;
    answer: string;
  }>;
  lastUpdated: number; // Added missing field
}

/**
 * Fallback holiday data for when API is not available
 */
const FALLBACK_HOLIDAY_DATA: Record<string, HolidayInfo> = {
  'Shabbat': {
    name: 'Shabbat',
    description: 'Shabbat is the weekly day of rest, beginning Friday at sunset and ending Saturday after nightfall. It commemorates God\'s completion of creation and the exodus from Egypt.',
    traditions: [
      'Friday night family dinner with special prayers (Kiddush)',
      'Three festive meals throughout the day',
      'Attending synagogue services',
      'Refraining from 39 categories of creative work',
      'Torah study and spiritual reflection'
    ],
    laws: [
      'Lighting candles before sunset on Friday',
      'Prohibition of 39 categories of creative labor (melachot)',
      'Reciting Kiddush over wine before meals',
      'Reciting Havdalah at the conclusion of Shabbat',
      'Eating three meals, including one after nightfall on Saturday'
    ],
    modernPractices: [
      'Unplugging from technology to focus on family and community',
      'Shabbat-friendly appliance adaptations like timers',
      'Community potluck meals for singles and young families',
      'Nature walks and screen-free activities',
      'Mindfulness and meditation practices'
    ],
    historicalContext: 'Shabbat observance is one of the oldest Jewish practices, mentioned in the Ten Commandments. Throughout history, Jews have maintained Shabbat observance even under persecution, as it became a defining aspect of Jewish identity.',
    lastUpdated: Date.now()
  },
  'Rosh Hashanah': {
    name: 'Rosh Hashanah',
    description: 'Rosh Hashanah is the Jewish New Year, marking the anniversary of creation and beginning the Ten Days of Repentance. It is a time of judgment, reflection, and hope for the coming year.',
    traditions: [
      'Blowing the shofar (ram\'s horn)',
      'Eating sweet foods, especially apples dipped in honey',
      'Special festive meals with symbolic foods',
      'Wearing white clothing',
      'Tashlich ceremony by a body of water'
    ],
    laws: [
      'Hearing the shofar (except when Rosh Hashanah falls on Shabbat)',
      'Extended prayer services including Mussaf with Malchuyot, Zichronot, and Shofarot',
      'Refraining from work as on Shabbat',
      'Reciting Kiddush and having festive meals',
      'Greeting others with "Shanah Tovah" (Good Year) or "Ketivah v\'Chatimah Tovah" (May you be inscribed and sealed for a good year)'
    ],
    modernPractices: [
      'Community-wide shofar blowing in parks for those who cannot attend synagogue',
      'Personal reflection retreats',
      'Creating New Year resolution lists based on Jewish values',
      'Virtual Rosh Hashanah services for those unable to attend in person',
      'Interfaith Rosh Hashanah gatherings and explanations'
    ],
    historicalContext: 'While the Torah refers to this holiday as Yom Teruah (Day of Blasting), it evolved to be known as Rosh Hashanah (Head of the Year) in the Mishnaic period. The holiday\'s themes of judgment and inscribing in the Book of Life developed through the Talmudic and medieval periods.',
    lastUpdated: Date.now()
  },
  'Purim': {
    name: 'Purim',
    description: 'Fallback: Celebrates the salvation of the Jewish people in ancient Persia.',
    traditions: ['Reading the Megillah', 'Mishloach Manot'],
    laws: ['Hearing the Megillah reading twice'],
    modernPractices: ['Costumes', 'Festive meal'],
    historicalContext: 'Fallback: Events described in the Book of Esther.',
    lastUpdated: 0
  }
};

// --- Helper Functions ---

const getApiKey = async (): Promise<string | null> => {
  // Implement logic to retrieve API key securely (e.g., from AsyncStorage)
  return await AsyncStorage.getItem('halacha_api_key'); // Example
};

const makeApiRequest = async (path: string, options: RequestInit = {}): Promise<any> => {
  const apiKey = await getApiKey();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody = 'Unknown API error';
      try {
        errorBody = await response.text();
      } catch (e) { /* Ignore parsing error */ }
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    if (response.status === 204) {
      return null; 
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

const importHolidaysFromHebCal = async (targetYear: number): Promise<boolean> => {
  console.log('Importing data from HebCal for year:', targetYear);
  const geoId = 3448439; // Example: Sao Paulo, Brazil - Make this configurable
  
  // Implement fetch with AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${targetYear}&month=x&ss=on&mf=on&c=on&geo=geoname&geonameid=${geoId}&m=50&s=on`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);

    if (response.ok && response.status === 200) {
      try {
        const data = await response.json();
        
        if (data?.items && Array.isArray(data.items)) {
          const items = data.items;
          
          // Store basic holiday data
          const holidays: Record<string, { date: string; desc?: string[] }> = {};
          items.forEach((item: any) => {
            if (item.category === 'holiday' || item.category === 'roshchodesh') {
              holidays[item.title] = {
                date: item.date,
                desc: item.memo ? [item.memo] : undefined,
              };
            }
          });
          
          // Store the basic data
          await AsyncStorage.setItem(
            `imported_holidays_basic_${targetYear}`,
            JSON.stringify(holidays)
          );
          
          console.log(`Successfully imported ${Object.keys(holidays).length} holidays from HebCal for ${targetYear}`);
          return true;
        } else {
          console.error('Invalid response structure from HebCal API:', data);
        }
      } catch (jsonError) {
        const text = await response.text();
        console.error('Failed to parse JSON from HebCal API. Response text:', text);
      }
    } else {
      const text = await response.text();
      console.error('Error fetching from HebCal API:', response.status, response.statusText, text);
    }
  } catch (apiError) {
    clearTimeout(timeoutId);
    if (apiError instanceof Error && apiError.name === 'AbortError') {
      console.error('HebCal API request timed out');
    } else {
      console.error('Error importing holidays from HebCal:', apiError);
    }
  }
  
  return false;
};

/**
 * Check if we need to trigger an automatic import
 * We'll import automatically if:
 * 1. We've never imported before
 * 2. It's been more than 7 days since the last import
 * 3. We're in a new month
 */
export const shouldTriggerImport = async (): Promise<boolean> => {
  // Keep existing logic, but ensure no axios calls
  const lastCheck = await AsyncStorage.getItem('last_api_check_timestamp');
  if (!lastCheck) return true; 

  const lastCheckTime = parseInt(lastCheck, 10);
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return lastCheckTime < oneWeekAgo;
};

/**
 * Update the last check timestamp
 */
export const updateLastCheckTimestamp = async (): Promise<void> => {
  // Keep existing logic, but ensure no axios calls
  await AsyncStorage.setItem('last_api_check_timestamp', Date.now().toString());
};

/**
 * Fetch holiday information from AI API
 */
export const fetchHolidayInfo = async (
  holidayName: string
): Promise<HolidayInfo | null> => {
  try {
    const data = await makeApiRequest(`/holidays/${encodeURIComponent(holidayName)}`);
    if (data) {
      if (data.name && data.description && Array.isArray(data.traditions)) { 
        return data as HolidayInfo; 
      }
    }

    if (FALLBACK_HOLIDAY_DATA[holidayName]) {
      return FALLBACK_HOLIDAY_DATA[holidayName];
    }

    return null;

  } catch (error) {
    if (FALLBACK_HOLIDAY_DATA[holidayName]) {
      return FALLBACK_HOLIDAY_DATA[holidayName];
    }
    return null;
  }
};

// Update Fallback data to include missing fields
const FALLBACK_ACTIVITY_INFO: Record<string, ActivityInfo> = {
  'shabbat-candles': {
    activityId: 'shabbat-candles', // Added ID
    detailedDescription: "Fallback description for Shabbat Candles.",
    practicalTips: ["Tip 1", "Tip 2"],
    commonQuestions: [{ question: "Q1?", answer: "A1." }],
    lastUpdated: 0 // Added timestamp
  },
  'daily-prayer': {
    activityId: 'daily-prayer', // Added ID
    detailedDescription: "Fallback description for Daily Prayer.",
    practicalTips: ["Tip 1", "Tip 2"],
    commonQuestions: [{ question: "Q1?", answer: "A1." }],
    lastUpdated: 0 // Added timestamp
  },
  'kosher-food': {
    activityId: 'kosher-food', // Added ID
    detailedDescription: "Fallback description for Kosher Food.",
    practicalTips: ["Tip 1", "Tip 2"],
    commonQuestions: [{ question: "Q1?", answer: "A1." }],
    lastUpdated: 0 // Added timestamp
  }
};

/**
 * Fetches enhanced information about a specific activity
 * @param activityId The ID of the activity to get information for
 * @returns Detailed information about the activity
 */
export const fetchActivityInfo = async (activityId: string): Promise<ActivityInfo> => {
  try {
    // Attempt to fetch from API first
    // const data = await makeApiRequest(`/activities/${activityId}/info`);
    // if (data) { 
    //    // Add validation here if needed
    //    return data as ActivityInfo; 
    // }

    // Simulate API call delay for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    // API failed or no data, use fallback
    if (FALLBACK_ACTIVITY_INFO[activityId]) {
      console.log(`Using fallback data for activity: ${activityId}`);
      return FALLBACK_ACTIVITY_INFO[activityId];
    }

    // Generate generic fallback if specific fallback not found
    console.log(`Using generic fallback for activity: ${activityId}`);
    return {
      activityId: activityId, // Added ID
      detailedDescription:
        'This activity is part of Jewish observance and tradition. Following halachic guidelines for this activity helps maintain the sanctity of Jewish life and strengthens connection to tradition.',
      practicalTips: [
        'Consult with your rabbi for specific guidance on this activity',
        'Learn about the underlying principles to better understand the practice',
        'Start with the basics before taking on more advanced aspects'
      ],
      commonQuestions: [
        {
          question: 'Is this activity required or optional?',
          answer: 'The obligation level varies based on specific circumstances and traditions. Consult with your rabbi for guidance relevant to your situation.'
        },
        {
          question: 'Are there different customs for this activity?',
          answer: "Yes, customs often vary between different Jewish communities (Ashkenazi, Sephardi, etc.). It's valuable to learn about your family's traditional practices."
        }
      ],
      lastUpdated: 0 // Added timestamp
    };

  } catch (error) {
    console.error(`Error fetching activity info for ${activityId}:`, error);
     // Attempt to use specific fallback on error
    if (FALLBACK_ACTIVITY_INFO[activityId]) {
      console.log(`Using fallback data for activity due to error: ${activityId}`);
      return FALLBACK_ACTIVITY_INFO[activityId];
    }
    // If fetch and specific fallback fail, return generic fallback
     console.log(`Using generic fallback for activity due to error: ${activityId}`);
     return {
      activityId: activityId,
      detailedDescription: 'Error loading details. Please consult reliable sources.',
      practicalTips: [],
      commonQuestions: [],
      lastUpdated: 0
    };
  }
};

/**
 * Get AI-enhanced explanation for a special day
 */
export const getEnhancedDayInfo = async (date: Date = new Date()): Promise<string | null> => {
  try {
    const hebrewDate = getCurrentHebrewDate(date);
    
    // If it's a special day, get enhanced information
    if (hebrewDate.specialDay) {
      const holidayInfo = await fetchHolidayInfo(hebrewDate.specialDay);
      
      if (holidayInfo) {
        return `
${holidayInfo.name} - ${holidayInfo.description}

Historical Context: ${holidayInfo.historicalContext}

Key Traditions:
${holidayInfo.traditions.map(t => `• ${t}`).join('\n')}

Important Laws:
${holidayInfo.laws.map(l => `• ${l}`).join('\n')}

Modern Practices:
${holidayInfo.modernPractices.map(p => `• ${p}`).join('\n')}
        `;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting enhanced day info:', error);
    return null;
  }
};

/**
 * Generate a personalized daily schedule based on the current day and preferences
 */
export const generateDailySchedule = async (
  date: Date = new Date(),
  preferences?: any
): Promise<string | null> => {
  try {
    const hebrewDate = getCurrentHebrewDate(date);
    const dayDescription = getJewishDayDescription(date);
    
    // Prepare AI prompt with day information and user preferences
    const prompt = `
      Generate a personalized Jewish daily schedule for ${dayDescription}.
      
      ${preferences ? `User preferences: ${JSON.stringify(preferences)}` : ''}
      
      Format the schedule as a bulleted list with times and activities
      appropriate for this specific day type (${hebrewDate.dayType}).
      
      Include prayer times, appropriate activities, and any special rituals or customs for this day.
      Keep the schedule realistic and practical, with 5-8 key activities for the day.
    `;
    
    // Example using makeApiRequest for an AI completion endpoint
    // const aiResponse = await makeApiRequest('/ai/generate-schedule', { 
    //   method: 'POST', 
    //   body: JSON.stringify({ prompt, preferences })
    // });
    // return aiResponse?.scheduleText || 'Could not generate schedule.';
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate AI call
    return "Generated schedule based on fallback/simulation."; // Placeholder
  } catch (error) {
    console.error('Error generating daily schedule:', error);
    return null;
  }
};

/**
 * Import and process bulk holiday data from external sources
 * Combines HebCal API data with AI-generated information
 */
export const importHolidayData = async (year?: number, location?: string): Promise<boolean> => {
  try {
    // Update the last check timestamp
    await updateLastCheckTimestamp();
    
    // Default to current year if not specified
    const targetYear = year || new Date().getFullYear();
    // Default to Jerusalem if not specified (geonameid for Jerusalem is 281184)
    const geoId = location === 'New York' ? '5128581' : 
                 location === 'London' ? '2643743' : 
                 location === 'Tel Aviv' ? '293397' : '281184';
    
    console.log(`Importing holiday data for year ${targetYear} with location ${geoId}`);
    
    // Get data from HebCal API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${targetYear}&month=x&ss=on&mf=on&c=on&geo=geoname&geonameid=${geoId}&m=50&s=on`,
        { signal: controller.signal } // Only pass the signal, not timeout
      );
      
      clearTimeout(timeoutId); // Clear the timeout if the fetch completes
      
      if (response.ok && response.status === 200) {
        const data = await response.json();
        
        if (data?.items && Array.isArray(data.items)) {
          const items = data.items;
          
          // Store basic holiday data
          const basicHolidays = items.map((item: any) => ({
            name: item.title || '',
            date: new Date(item.date),
            category: item.category || '',
            description: item.memo || '',
            hebrew: item.hebrew || '',
            yomtov: !!item.yomtov,
            subcat: item.subcat || '',
          }));
          
          await AsyncStorage.setItem('imported_holidays_basic', JSON.stringify(basicHolidays));
          
          // Process holidays - limit to a few key ones to speed up the process
          const majorHolidays = USE_DEMO_MODE ? 
            ['Rosh Hashanah', 'Yom Kippur', 'Sukkot', 'Shabbat'] : // In demo mode, only get these
            items
              .filter((item: any) => 
                item.category === 'holiday' && 
                ['major', 'roshchodesh', 'mevarchim'].includes(item.subcat)
              )
              .map((item: any) => item.title)
              .filter((value: string, index: number, self: string[]) => 
                // Remove duplicates
                self.indexOf(value) === index
              );
          
          console.log(`Enhancing ${majorHolidays.length} major holidays`);
          
          // Process holidays in batches to avoid rate limits
          const batchSize = USE_DEMO_MODE ? 4 : 2; // Process more at once in demo mode
          const enhancedHolidays: HolidayInfo[] = [];
          
          for (let i = 0; i < majorHolidays.length; i += batchSize) {
            const batch = majorHolidays.slice(i, i + batchSize);
            const batchPromises = batch.map((holiday: string) => fetchHolidayInfo(holiday));
            
            const batchResults = await Promise.all(batchPromises);
            enhancedHolidays.push(...batchResults.filter(Boolean) as HolidayInfo[]);
            
            // Add a delay between batches to avoid rate limits (not needed in demo mode)
            if (!USE_DEMO_MODE && i + batchSize < majorHolidays.length) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          // Store enhanced holiday data
          await AsyncStorage.setItem('imported_holidays_enhanced', JSON.stringify(enhancedHolidays));
          
          // Generate additional data for Shabbat times
          const shabbatItems = items.filter((item: any) => 
            item.category === 'candles' || item.category === 'havdalah'
          );
          
          // Group candles and havdalah times by date
          const shabbatTimes: Record<string, {candles?: string, havdalah?: string, date: Date}> = {};
          
          shabbatItems.forEach((item: any) => {
            // Get just the date part in ISO format (YYYY-MM-DD)
            const dateKey = item.date.split('T')[0];
            const itemDate = new Date(item.date);
            
            if (!shabbatTimes[dateKey]) {
              shabbatTimes[dateKey] = { date: itemDate };
            }
            
            if (item.category === 'candles') {
              shabbatTimes[dateKey].candles = item.title.split(': ')[1];
            } else if (item.category === 'havdalah') {
              shabbatTimes[dateKey].havdalah = item.title.split(': ')[1];
            }
          });
          
          await AsyncStorage.setItem('imported_shabbat_times', JSON.stringify(Object.values(shabbatTimes)));
          
          console.log('Successfully imported and enhanced holiday data');
          return true;
        } else {
          console.error('Invalid response from HebCal API:', data);
        }
      } else {
        console.error('Invalid response from HebCal API:', response.statusText);
      }
    } catch (apiError) {
      console.error('HebCal API error:', apiError);
      
      // Create basic fallback data for testing
      if (USE_DEMO_MODE) {
        console.log('Using fallback hebcal data');
        
        // Generate basic Shabbat dates for this year
        const basicHolidays = [];
        const shabbatTimes = [];
        
        // Current date
        const startDate = new Date();
        
        // Get 12 upcoming Shabbats
        for (let i = 0; i < 12; i++) {
          // Find the next Friday
          const friday = new Date(startDate);
          friday.setDate(startDate.getDate() + ((5 + 7 - startDate.getDay()) % 7) + (i * 7));
          
          // Create Shabbat entry
          basicHolidays.push({
            name: 'Shabbat',
            date: new Date(friday),
            category: 'holiday',
            description: 'Weekly day of rest from Friday at sunset to Saturday at nightfall',
            hebrew: 'שַׁבָּת',
            yomtov: true,
            subcat: 'major',
          });
          
          // Create candle lighting and havdalah times
          const candleTime = new Date(friday);
          candleTime.setHours(18, 30, 0, 0); // 6:30 PM
          
          const saturday = new Date(friday);
          saturday.setDate(friday.getDate() + 1);
          const havdalahTime = new Date(saturday);
          havdalahTime.setHours(19, 30, 0, 0); // 7:30 PM
          
          const dateKey = friday.toISOString().split('T')[0];
          shabbatTimes.push({
            date: friday,
            candles: '6:30 PM',
            havdalah: '7:30 PM'
          });
        }
        
        // Add some major holidays
        const newYear = new Date();
        newYear.setMonth(8, 15); // Arbitrary date for demo
        basicHolidays.push({
          name: 'Rosh Hashanah',
          date: new Date(newYear),
          category: 'holiday',
          description: 'Jewish New Year',
          hebrew: 'רֹאשׁ הַשָּׁנָה',
          yomtov: true,
          subcat: 'major',
        });
        
        // Store fallback data
        await AsyncStorage.setItem('imported_holidays_basic', JSON.stringify(basicHolidays));
        await AsyncStorage.setItem('imported_holidays_enhanced', JSON.stringify([
          FALLBACK_HOLIDAY_DATA['Shabbat'],
          FALLBACK_HOLIDAY_DATA['Rosh Hashanah']
        ]));
        await AsyncStorage.setItem('imported_shabbat_times', JSON.stringify(shabbatTimes));
        
        console.log('Successfully generated fallback holiday data');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error importing holiday data:', error);
    return false;
  }
};

/**
 * Get imported holiday information for a specific date
 */
export const getHolidayForDate = async (date: Date): Promise<any | null> => {
  try {
    // Format the date as YYYY-MM-DD for comparison
    const dateStr = date.toISOString().split('T')[0];
    
    // Get basic holiday data
    const basicData = await AsyncStorage.getItem('imported_holidays_basic');
    if (!basicData) return null;
    
    const holidays = JSON.parse(basicData);
    
    // Find holidays that match the requested date
    const matchingHolidays = holidays.filter((holiday: any) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toISOString().split('T')[0] === dateStr;
    });
    
    if (matchingHolidays.length === 0) return null;
    
    // Check for enhanced data
    const enhancedData = await AsyncStorage.getItem('imported_holidays_enhanced');
    let enhancedHolidays = [];
    
    if (enhancedData) {
      enhancedHolidays = JSON.parse(enhancedData);
    }
    
    // Add enhanced information if available
    return matchingHolidays.map((holiday: any) => {
      const enhanced = enhancedHolidays.find((eh: HolidayInfo) => eh.name.includes(holiday.name));
      
      return {
        ...holiday,
        enhanced: enhanced || null
      };
    });
  } catch (error) {
    console.error('Error getting holiday for date:', error);
    return null;
  }
};

/**
 * Get Shabbat times for a specific date
 */
export const getShabbatTimesForDate = async (date: Date): Promise<{candles?: string, havdalah?: string} | null> => {
  try {
    // Format the date to get the Friday of that week
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilFriday = day <= 5 ? 5 - day : 6; // If Saturday, get next Friday
    
    const friday = new Date(date);
    friday.setDate(date.getDate() + daysUntilFriday);
    const fridayStr = friday.toISOString().split('T')[0];
    
    // Get stored Shabbat times
    const timesData = await AsyncStorage.getItem('imported_shabbat_times');
    if (!timesData) return null;
    
    const times = JSON.parse(timesData);
    
    // Find times for the Friday
    const shabbatTime = times.find((time: any) => {
      const timeDate = new Date(time.date);
      return timeDate.toISOString().split('T')[0] === fridayStr;
    });
    
    return shabbatTime || null;
  } catch (error) {
    console.error('Error getting Shabbat times:', error);
    return null;
  }
};

/**
 * Preload holiday images to ensure they're ready when needed
 * This helps reduce UI loading time when displaying holiday information
 */
export const preloadHolidayImages = async (): Promise<void> => {
  try {
    // Common Jewish holidays that might have images
    const commonHolidays = [
      'Shabbat',
      'Rosh Hashanah',
      'Yom Kippur',
      'Sukkot',
      'Simchat Torah',
      'Chanukah',
      'Tu BiShvat',
      'Purim',
      'Passover',
      'Shavuot'
    ];
    
    // URLs for holiday images (these would be real image URLs in production)
    const holidayImageMap: Record<string, string> = {
      'Shabbat': 'https://example.com/images/shabbat.jpg',
      'Rosh Hashanah': 'https://example.com/images/rosh-hashanah.jpg',
      'Yom Kippur': 'https://example.com/images/yom-kippur.jpg',
      'Sukkot': 'https://example.com/images/sukkot.jpg',
      'Simchat Torah': 'https://example.com/images/simchat-torah.jpg',
      'Chanukah': 'https://example.com/images/chanukah.jpg',
      'Purim': 'https://example.com/images/purim.jpg',
      'Passover': 'https://example.com/images/passover.jpg',
      'Shavuot': 'https://example.com/images/shavuot.jpg'
    };
    
    // In a real app, you would use Image.prefetch for each URL
    // For demonstration, we're just logging that we would prefetch
    console.log('Would preload images for holidays:', Object.keys(holidayImageMap));
    
    // Example of actual prefetching code (commented out since we don't have real URLs)
    /*
    import { Image } from 'react-native';
    
    // Prefetch images in parallel
    const prefetchPromises = Object.values(holidayImageMap).map(url => 
      Image.prefetch(url).catch(err => console.warn(`Failed to preload image: ${url}`, err))
    );
    
    await Promise.all(prefetchPromises);
    */
    
    console.log('Holiday image preloading complete');
  } catch (error) {
    console.error('Error preloading holiday images:', error);
  }
};

// Export types
export type { HolidayInfo, ActivityInfo }; 