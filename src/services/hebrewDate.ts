import { JewishDate as AppJewishDate, DayType } from '../types/data';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add type declaration for require
declare const require: any;

// Define types for kosher-zmanim classes
interface KosherZmanimClasses {
  JewishCalendar: any;
  JewishDate: any;
  HebrewDateFormatter: any;
  Daf: any;
  ZmanimCalendar: any;
  TimeZone: any;
  GeoLocation: any;
  Date: any;
}

// Define fallback implementations
const createFallbackImplementations = () => {
  class FallbackJewishCalendar {
    private date: Date;
    private jewishDate: { day: number; month: number; year: number };
    private inIsrael: boolean;

    constructor() {
      this.date = new Date();
      this.jewishDate = { day: 1, month: 1, year: 5783 };
      this.inIsrael = false;
    }

    setDate(date: Date) {
      this.date = date;
      this.jewishDate = convertDateToJewishDate(date);
    }

    isYomTov() { return false; }
    isTaanis() { return false; }
    isRoshChodesh() { return false; }
    isErevYomTov() { return false; }
    isErevRoshChodesh() { return false; }
    isCholHamoed() { return false; }
    getYomTovIndex() { return 0; }
    getDayOfWeek() { return (this.date ? this.date.getDay() : new Date().getDay()) || 0; }
    getJewishDayOfMonth() { return this.jewishDate.day; }
    getJewishMonth() { return this.jewishDate.month; }
    getJewishYear() { return this.jewishDate.year; }
  }

  class FallbackJewishDate {
    private date: Date;
    private jewishDay: number;
    private jewishMonth: number;
    private jewishYear: number;

    constructor() {
      this.date = new Date();
      this.jewishDay = 1;
      this.jewishMonth = 1;
      this.jewishYear = 5783;
    }

    setDate(date: Date) {
      this.date = date;
      const { day, month, year } = convertDateToJewishDate(date);
      this.jewishDay = day;
      this.jewishMonth = month;
      this.jewishYear = year;
    }

    getJewishDayOfMonth() { return this.jewishDay; }
    getJewishMonth() { return this.jewishMonth; }
    getJewishYear() { return this.jewishYear; }
    isJewishLeapYear() { return false; }
    getDayOfWeek() { return this.date.getDay(); }
  }

  class FallbackHebrewDateFormatter {
    constructor() {}

    format(jewishDate: any) {
      return '1 Nisan 5783';
    }

    formatDafYomiBavli() {
      return 'Berachot 2';
    }

    formatHebrewNumber(number: number) {
      return number.toString();
    }

    formatMonth(month: number) {
      return HEBREW_MONTH_NAMES[month - 1] || 'Nissan';
    }
  }

  class FallbackDaf {
    constructor() {}

    setDaf(daf: number, masechta: number) {
      // No-op
    }

    getDaf() { return 1; }
    getMasechta() { return 0; }
    getMasechtaTransliterated() { return "Berachot"; }
  }

  class FallbackZmanimCalendar {
    private date: Date;
    private latitude: number;
    private longitude: number;
    private elevation: number;

    constructor() {
      this.date = new Date();
      this.latitude = 31.778;
      this.longitude = 35.2354;
      this.elevation = 800;
    }

    setDate(date: Date) {
      this.date = date;
    }

    setLatitude(latitude: number) {
      this.latitude = latitude;
    }

    setLongitude(longitude: number) {
      this.longitude = longitude;
    }

    setElevation(elevation: number) {
      this.elevation = elevation;
    }

    getElevation() { return this.elevation; }
    getGeoLocation() { return { getLatitude: () => this.latitude, getLongitude: () => this.longitude }; }
    getDate() { return this.date; }

    getSunrise() {
      return new Date(this.date.setHours(6, 0, 0, 0));
    }

    getSunset() {
      return new Date(this.date.setHours(18, 0, 0, 0));
    }

    getTzais() {
      return new Date(this.date.setHours(19, 0, 0, 0));
    }

    getTzeitHakochavim() {
      return new Date(this.date.setHours(19, 30, 0, 0));
    }

    getCandleLighting() {
      return new Date(this.date.setHours(17, 0, 0, 0));
    }
  }

  class FallbackGeoLocation {
    private latitude: number;
    private longitude: number;
    private elevation: number;

    constructor(lat: number, lon: number, elev: number) {
      this.latitude = lat;
      this.longitude = lon;
      this.elevation = elev;
    }

    getLatitude() { return this.latitude; }
    getLongitude() { return this.longitude; }
    getElevation() { return this.elevation; }
  }

  return {
    JewishCalendar: FallbackJewishCalendar,
    JewishDate: FallbackJewishDate,
    HebrewDateFormatter: FallbackHebrewDateFormatter,
    Daf: FallbackDaf,
    ZmanimCalendar: FallbackZmanimCalendar,
    TimeZone: { getTimeZone: () => 'Asia/Jerusalem' },
    GeoLocation: FallbackGeoLocation,
    Date: Date
  };
};

// Use a try-catch block for requiring the kosher-zmanim package
let kosherZmanimModule: any;
let KosherZmanim: KosherZmanimClasses | undefined;

try {
  // Use CommonJS require syntax
  kosherZmanimModule = require('kosher-zmanim');
  KosherZmanim = {
    JewishCalendar: kosherZmanimModule?.JewishCalendar,
    JewishDate: kosherZmanimModule?.JewishDate,
    HebrewDateFormatter: kosherZmanimModule?.HebrewDateFormatter,
    Daf: kosherZmanimModule?.Daf,
    ZmanimCalendar: kosherZmanimModule?.ZmanimCalendar,
    TimeZone: kosherZmanimModule?.TimeZone,
    GeoLocation: kosherZmanimModule?.GeoLocation,
    Date: kosherZmanimModule?.Date
  };
} catch (error) {
  console.error('Error loading kosher-zmanim library:', error);
  // Create fallback implementations
  KosherZmanim = createFallbackImplementations();
}

// Maps Hebrew month names
const HEBREW_MONTH_NAMES = [
  'Nissan',
  'Iyar',
  'Sivan',
  'Tammuz',
  'Av',
  'Elul',
  'Tishrei',
  'Cheshvan',
  'Kislev',
  'Tevet',
  'Shevat',
  'Adar',
  'Adar II',
];

// Define a location interface for our app
interface Location {
  latitude: number;
  longitude: number;
  elevation?: number;
  timeZoneId?: string;
  locationName?: string;
  isDefault?: boolean;
}

// Default location (Jerusalem)
const DEFAULT_LOCATION: Location = {
  latitude: 31.778,
  longitude: 35.2354,
  elevation: 800,
  timeZoneId: 'Asia/Jerusalem',
  locationName: 'Jerusalem',
  isDefault: true
};

// Store the user's location
let userLocation: Location = DEFAULT_LOCATION;

/**
 * Initialize user location from storage or use default
 */
export const initializeLocation = async (): Promise<void> => {
  try {
    const storedLocation = await AsyncStorage.getItem('user_location');
    if (storedLocation) {
      userLocation = JSON.parse(storedLocation);
    }
  } catch (error) {
    console.error('Error loading user location:', error);
  }
};

/**
 * Set user location for zmanim calculations
 */
export const setUserLocation = (location: Location): void => {
  userLocation = { ...location };
  AsyncStorage.setItem('user_location', JSON.stringify(userLocation));
};

/**
 * Helper function to set location for zmanim calculations
 */
const setLocationForZmanim = (zmanimCalendar: any, location: Location): void => {
  try {
    if (!zmanimCalendar || typeof zmanimCalendar.setLatitude !== 'function') {
      console.warn('ZmanimCalendar not properly initialized');
      return;
    }
    
    // Set location parameters directly
    zmanimCalendar.setLatitude(location.latitude);
    zmanimCalendar.setLongitude(location.longitude);
    if (location.elevation !== undefined) {
      zmanimCalendar.setElevation(location.elevation);
    }
  } catch (error) {
    console.error('Error setting location for zmanim:', error);
  }
};

// Helper function to create a ZmanimCalendar instance
const createZmanimCalendar = (date: Date = new Date()): any => {
  try {
    if (!KosherZmanim?.ZmanimCalendar) {
      throw new Error('ZmanimCalendar not available');
    }
    
    const zmanim = new KosherZmanim.ZmanimCalendar();
    setLocationForZmanim(zmanim, userLocation);
    zmanim.setDate(date);
    return zmanim;
  } catch (error) {
    console.error('Error creating ZmanimCalendar:', error);
    return null;
  }
};

/**
 * Helper to convert JS Date to Jewish year/month/day integers
 * This provides fallback functionality if the kosher-zmanim library fails
 */
const convertDateToJewishDate = (date: Date): { year: number, month: number, day: number } => {
  try {
    // If the JewishDate class is available, use it
    if (KosherZmanim?.JewishDate) {
      // Create a Jewish date from a JS Date
      const jewishDate = new KosherZmanim.JewishDate();
      
      // Set date using day, month, year as integers
      jewishDate.setDate(
        date.getFullYear(),     // Gregorian year
        date.getMonth() + 1,    // Gregorian month (0-indexed in JS, 1-indexed in kosher-zmanim)
        date.getDate()          // Gregorian day
      );
      
      return {
        year: jewishDate.getJewishYear(),
        month: jewishDate.getJewishMonth(),
        day: jewishDate.getJewishDayOfMonth()
      };
    }
  } catch (error) {
    console.error('Error converting to Jewish date:', error);
  }
  
  // Fallback: Return placeholder values
  return {
    year: 5783, // Default to a reasonable year
    month: 1,   // Default to Nisan
    day: 1      // Default to first day
  };
};

/**
 * Format a time string from a Date object
 */
const formatTime = (date: Date): string => {
  try {
    // Use locale-specific formatting with proper timezone
    const userTimeZone = userLocation.timeZoneId || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimeZone
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    // Fallback formatting
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
};

/**
 * Get the current Hebrew date with proper timezone handling
 */
export const getCurrentHebrewDate = (date: Date = new Date()): AppJewishDate => {
  try {
    // Ensure we're working with a valid Date object
    const inputDate = new Date(date);
    
    // Set time to noon to avoid timezone issues
    inputDate.setHours(12, 0, 0, 0);
    
    // Try to create a JewishCalendar instance
    try {
      if (!KosherZmanim?.JewishCalendar) {
        throw new Error('JewishCalendar not available');
      }
      
      // Create new Jewish calendar
      const calendar = new KosherZmanim.JewishCalendar();
      
      // Set the date
      calendar.setDate(inputDate);
      
      // Determine day type
      let dayType: DayType = 'regular';
      
      // Check if Shabbat (Saturday)
      if (inputDate.getDay() === 6) {
        dayType = 'shabbat';
      } 
      // Check for other special days
      else if (calendar.isYomTov?.()) {
        dayType = 'yomTov';
      } else if (calendar.isTaanis?.()) {
        dayType = 'fastDay';
      } else if (calendar.isRoshChodesh?.()) {
        dayType = 'roshChodesh';
      }
      
      // Get Hebrew date components
      const formatter = new KosherZmanim.HebrewDateFormatter();
      
      let hebrewDayOfMonth = 1;
      let hebrewMonth = 1;
      let hebrewYear = 5784; // Default to current Hebrew year
      
      try {
        hebrewDayOfMonth = calendar.getJewishDayOfMonth() || 1;
        hebrewMonth = calendar.getJewishMonth() || 1;
        hebrewYear = calendar.getJewishYear() || 5784;
      } catch (dateError) {
        console.error('Error getting Jewish date components:', dateError);
      }
      
      // Format Hebrew date as a string
      let hebrewDateString = '';
      try {
        hebrewDateString = formatter.format(calendar);
      } catch (formatError) {
        // If formatter fails, create a manual string
        hebrewDateString = `${hebrewDayOfMonth} ${HEBREW_MONTH_NAMES[hebrewMonth - 1]} ${hebrewYear}`;
      }
      
      // Get special day name if applicable
      const specialDay = getSpecialDayName(calendar);
      
      // Get candle lighting and havdalah times if it's Friday or Saturday
      const dayOfWeek = inputDate.getDay();
      let candles;
      
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
        candles = getCandleTimes(inputDate);
      }
      
      // Get Daf Yomi
      let dafYomi = '';
      try {
        if (KosherZmanim?.Daf) {
          const daf = new KosherZmanim.Daf();
          daf.setDate?.(inputDate);
          dafYomi = formatter.formatDafYomiBavli?.(daf) || '';
        }
      } catch (dafError) {
        console.error('Error calculating Daf Yomi:', dafError);
        // Provide fallback Daf Yomi
        dafYomi = 'Daf Yomi information unavailable';
      }
      
      // Return Jewish date details
      return {
        gregorianDate: inputDate,
        hebrewDate: hebrewDateString,
        hebrewDay: hebrewDayOfMonth,
        hebrewMonth: HEBREW_MONTH_NAMES[hebrewMonth - 1],
        hebrewYear: hebrewYear,
        dayType,
        specialDay,
        candles,
        dafYomi
      };
    } catch (calendarError) {
      console.error('Error creating Jewish calendar:', calendarError);
      
      // Create fallback Jewish date based on simple calculations
      // This is not accurate but provides some data when the kosher-zmanim library fails
      const fallbackDate = createFallbackHebrewDate(inputDate);
      
      return {
        gregorianDate: inputDate,
        hebrewDate: `${fallbackDate.day} ${HEBREW_MONTH_NAMES[fallbackDate.month - 1]} ${fallbackDate.year}`,
        hebrewDay: fallbackDate.day,
        hebrewMonth: HEBREW_MONTH_NAMES[fallbackDate.month - 1],
        hebrewYear: fallbackDate.year,
        dayType: inputDate.getDay() === 6 ? 'shabbat' : 'regular',
        specialDay: inputDate.getDay() === 6 ? 'Shabbat' : undefined,
        candles: inputDate.getDay() === 5 || inputDate.getDay() === 6 ? getCandleTimes(inputDate) : undefined,
        dafYomi: 'Daf Yomi information unavailable'
      };
    }
  } catch (error) {
    console.error('Error in getCurrentHebrewDate:', error);
    
    // Return a very basic fallback
    const todayDate = new Date();
    
    return {
      gregorianDate: todayDate,
      hebrewDate: '1 Nisan 5784',
      hebrewDay: 1,
      hebrewMonth: 'Nisan',
      hebrewYear: 5784,
      dayType: 'regular',
      specialDay: undefined,
      candles: undefined,
      dafYomi: 'Daf Yomi information unavailable'
    };
  }
};

// Create a fallback Hebrew date calculation
// This is a very rough approximation for when the library fails
const createFallbackHebrewDate = (date: Date): { day: number; month: number; year: number } => {
  // This is an extremely simplified calculation and not accurate
  // It's only used as a last resort when the proper library fails
  const timestamp = date.getTime();
  
  // Approximate start of Hebrew year 5784 (Sept 2023)
  const hebrewYear5784Start = new Date(2023, 8, 15).getTime(); 
  
  // Estimate if we're before or after Hebrew year 5784
  const hebrewYear = timestamp < hebrewYear5784Start ? 5783 : 5784;
  
  // Very rough approximation of Hebrew month 
  // (this is not accurate due to leap years and variable month lengths)
  const month = ((date.getMonth() + 8) % 12) + 1;
  
  // Day is the same as Gregorian day, but this is very inaccurate
  // It's just a rough approximation for display purposes
  const day = date.getDate();
  
  return { day, month, year: hebrewYear };
};

/**
 * Calculate candle lighting and havdalah times with proper zmanim
 */
const getCandleTimes = (date: Date): { lighting: string; havdalah: string } => {
  try {
    // Create a new date object for Friday (candle lighting)
    const today = new Date(date);
    const targetDate = new Date(today);
    
    // If it's not Friday, find the next Friday for candle lighting
    if (today.getDay() !== 5) { // 5 = Friday
      const daysUntilFriday = (5 - today.getDay() + 7) % 7;
      targetDate.setDate(today.getDate() + daysUntilFriday);
    }
    
    // Create zmanim calendar for Friday
    if (!KosherZmanim?.ZmanimCalendar) {
      throw new Error('ZmanimCalendar not available');
    }
    
    const fridayZmanim = new KosherZmanim.ZmanimCalendar();
    setLocationForZmanim(fridayZmanim, userLocation);
    fridayZmanim.setDate(targetDate);
    
    // Create a new date object for Saturday (havdalah)
    const saturdayDate = new Date(targetDate);
    saturdayDate.setDate(targetDate.getDate() + 1);
    
    const saturdayZmanim = new KosherZmanim.ZmanimCalendar();
    setLocationForZmanim(saturdayZmanim, userLocation);
    saturdayZmanim.setDate(saturdayDate);
    
    let lighting = '';
    let havdalah = '';
    
    // Calculate candle lighting time (18 minutes before sunset)
    const fridaySunset = fridayZmanim.getSunset();
    if (fridaySunset) {
      const candleTime = new Date(fridaySunset);
      candleTime.setMinutes(candleTime.getMinutes() - 18);
      lighting = formatTime(candleTime);
    }
    
    // Calculate havdalah time (42 minutes after sunset)
    const saturdaySunset = saturdayZmanim.getSunset();
    if (saturdaySunset) {
      const havdalahTime = new Date(saturdaySunset);
      havdalahTime.setMinutes(havdalahTime.getMinutes() + 42);
      havdalah = formatTime(havdalahTime);
    }
    
    return { lighting, havdalah };
  } catch (error) {
    console.error('Error calculating candle times:', error);
    return { lighting: '', havdalah: '' };
  }
};

/**
 * Get prayer times for the day
 */
export const getPrayerTimes = (date: Date = new Date()): {
  shacharis: string;
  mincha: string;
  maariv: string;
} => {
  try {
    // Only create calendar if class is available
    let zmanim: any = null;
    if (KosherZmanim?.ZmanimCalendar) {
      try {
        zmanim = new KosherZmanim.ZmanimCalendar();
        setLocationForZmanim(zmanim, userLocation);
      } catch (error) {
        console.error('Error creating ZmanimCalendar for prayer times:', error);
      }
    }
    
    // Get prayer times with fallbacks
    let shacharisTime: Date | null = null;
    let minchaTime: Date | null = null;
    let maarivTime: Date | null = null;
    
    // For Shacharis, use sunrise
    try {
      shacharisTime = zmanim?.getSunrise ? zmanim.getSunrise() : null;
    } catch (error) {
      console.warn('Error getting Shacharis time:', error);
    }
    
    // For Mincha, use Mincha Gedola (earliest time for Mincha)
    try {
      minchaTime = zmanim?.getMinchaGedola ? zmanim.getMinchaGedola() : null;
    } catch (error) {
      console.warn('Error getting Mincha time:', error);
      // Fallback: noon + 30 minutes
      const noon = new Date(date);
      noon.setHours(12, 30, 0, 0);
      minchaTime = noon;
    }
    
    // For Maariv, use Tzait (nightfall)
    try {
      maarivTime = zmanim?.getTzait ? zmanim.getTzait() : null;
    } catch (error) {
      console.warn('Error getting Maariv time:', error);
      // Fallback: sunset + 45 minutes
      try {
        const sunset = zmanim?.getSunset ? zmanim.getSunset() : null;
        if (sunset) {
          maarivTime = new Date(sunset);
          maarivTime.setMinutes(maarivTime.getMinutes() + 45);
        } else {
          // Ultimate fallback: 7:30 PM
          const evening = new Date(date);
          evening.setHours(19, 30, 0, 0);
          maarivTime = evening;
        }
      } catch (error) {
        console.warn('Error getting sunset for Maariv fallback:', error);
        // Ultimate fallback: 7:30 PM
        const evening = new Date(date);
        evening.setHours(19, 30, 0, 0);
        maarivTime = evening;
      }
    }
    
    // Format times or provide placeholders
    const shacharis = shacharisTime ? formatTime(shacharisTime) : 'Not available';
    const mincha = minchaTime ? formatTime(minchaTime) : 'Not available';
    const maariv = maarivTime ? formatTime(maarivTime) : 'Not available';
    
    return {
      shacharis,
      mincha,
      maariv,
    };
  } catch (error) {
    console.error('Error getting prayer times:', error);
    // Return placeholders if calculation fails
    return {
      shacharis: 'Not available',
      mincha: 'Not available',
      maariv: 'Not available',
    };
  }
};

/**
 * Get upcoming special days with proper date handling
 */
export const getUpcomingSpecialDays = (numberOfDays: number = 7): AppJewishDate[] => {
  try {
    const specialDays: AppJewishDate[] = [];
    const today = new Date();
    
    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const hebrewDate = getCurrentHebrewDate(date);
      if (hebrewDate.dayType !== 'regular') {
        specialDays.push(hebrewDate);
      }
    }
    
    return specialDays;
  } catch (error) {
    console.error('Error getting upcoming special days:', error);
    return [];
  }
};

/**
 * Get today's Daf Yomi page
 */
export const getDafYomi = (date: Date = new Date()): { masechta: string; daf: string } => {
  try {
    if (!KosherZmanim?.Daf) {
      return {
        masechta: 'Not available',
        daf: 'Not available',
      };
    }
    
    const daf = new KosherZmanim.Daf();
    daf.setDate(date);
    
    try {
      return {
        masechta: daf.getMasechtaTransliterated(),
        daf: `${daf.getDaf()}`,
      };
    } catch (error) {
      console.warn('Error getting masechta/daf:', error);
      return {
        masechta: 'Unknown',
        daf: 'Unknown',
      };
    }
  } catch (error) {
    console.error('Error calculating Daf Yomi:', error);
    return {
      masechta: 'Not available',
      daf: 'Not available',
    };
  }
};

/**
 * Check if a date is Shabbat
 */
export const isShabbat = (date: Date = new Date()): boolean => {
  return date.getDay() === 6;
};

/**
 * Check if a date is a Jewish holiday
 */
export const isHoliday = (date: Date = new Date()): boolean => {
  try {
    if (!KosherZmanim?.JewishCalendar) {
      return false;
    }
    
    const calendar = new KosherZmanim.JewishCalendar();
    calendar.setDate(date);
    return calendar.isYomTov();
  } catch (error) {
    console.error('Error checking holiday status:', error);
    return false;
  }
};

/**
 * Get a readable description of the current Jewish day
 */
export const getJewishDayDescription = (date: Date = new Date()): string => {
  try {
    const hebrewDate = getCurrentHebrewDate(date);
    
    if (hebrewDate.specialDay) {
      return `${hebrewDate.specialDay} (${hebrewDate.hebrewDateString})`;
    }
    
    return hebrewDate.hebrewDateString;
  } catch (error) {
    console.error('Error getting Jewish day description:', error);
    return 'Unknown Jewish Date';
  }
};

/**
 * Get the name of a special day from a JewishCalendar instance
 */
const getSpecialDayName = (calendar: any): string | undefined => {
  try {
    // Check if we're using the fallback implementation
    if (!calendar || typeof calendar.isYomTov !== 'function') {
      return undefined;
    }

    // Check for various special days
    if (calendar.isYomTov()) {
      const yomTovIndex = calendar.getYomTovIndex();
      switch (yomTovIndex) {
        case 0: return 'Rosh Hashana';
        case 1: return 'Yom Kippur';
        case 2: return 'Sukkot';
        case 3: return 'Shemini Atzeret';
        case 4: return 'Simchat Torah';
        case 5: return 'Pesach';
        case 6: return 'Shavuot';
        default: return 'Yom Tov';
      }
    } else if (calendar.isTaanis()) {
      return 'Fast Day';
    } else if (calendar.isRoshChodesh()) {
      return 'Rosh Chodesh';
    } else if (calendar.isErevYomTov()) {
      return 'Erev Yom Tov';
    } else if (calendar.isErevRoshChodesh()) {
      return 'Erev Rosh Chodesh';
    } else if (calendar.isCholHamoed()) {
      return 'Chol Hamoed';
    }
    return undefined;
  } catch (error) {
    console.error('Error getting special day name:', error);
    return undefined;
  }
};

/**
 * Get enhanced information about the current day or a special day
 */
export const getEnhancedDayInfo = async (): Promise<string> => {
  try {
    const date = getCurrentHebrewDate();
    
    if (!date.specialDay) {
      return "Today is a regular day in the Jewish calendar.";
    }
    
    // Return information based on the special day
    switch (date.specialDay) {
      case 'Shabbat':
        return "Shabbat is the Jewish day of rest, observed from Friday at sunset until Saturday nightfall. It commemorates God's day of rest after six days of creation. Jewish law prohibits work on Shabbat, with many activities forbidden including cooking, writing, and using electronic devices.";
      
      case 'Rosh Hashana':
        return "Rosh Hashana marks the Jewish New Year and begins the ten days of repentance leading to Yom Kippur. It's a time of reflection, prayer, and the blowing of the shofar (ram's horn). Traditional foods include apples dipped in honey to symbolize the hope for a sweet new year.";
      
      case 'Yom Kippur':
        return "Yom Kippur, the Day of Atonement, is considered the holiest day in Judaism. It's observed with a 25-hour fast and intensive prayer, focusing on repentance and atonement for sins committed during the past year. Many spend the entire day in synagogue services.";
      
      case 'Sukkot':
        return "Sukkot, the Feast of Tabernacles, commemorates the years the Jews spent in the desert after the Exodus from Egypt. Jews build temporary structures (sukkot) where they eat and sometimes sleep during the 7-day festival. The Four Species (etrog, lulav, hadass, and aravah) are waved daily.";
      
      case 'Shemini Atzeret':
        return "Shemini Atzeret is a holiday celebrated on the eighth day of Sukkot. It's considered a separate holiday where Jews pray for rain for the coming year. In Israel, it's combined with Simchat Torah, while outside Israel they're celebrated as separate holidays.";
      
      case 'Simchat Torah':
        return "Simchat Torah celebrates the completion of the annual Torah reading cycle. The holiday is marked by joyous celebrations including dancing with Torah scrolls during hakafot (circuits) around the synagogue. The last portion of Deuteronomy is read followed immediately by the first chapter of Genesis.";
      
      case 'Chanukah':
        return "Chanukah, the Festival of Lights, commemorates the victory of the Maccabees over the Greeks and the miracle of oil lasting for eight days in the rededicated Temple. It's celebrated by lighting the menorah, playing dreidel, and eating foods fried in oil like latkes and sufganiyot.";
      
      case 'Purim':
        return "Purim celebrates the salvation of the Jewish people from Haman's plot to destroy them, as recorded in the Book of Esther. It's celebrated by reading the Megillah, giving gifts of food (mishloach manot), donating to the poor, and a festive meal. Many dress in costumes and the day has a carnival-like atmosphere.";
      
      case 'Pesach':
        return "Pesach (Passover) commemorates the liberation of the Israelites from Egyptian slavery. The holiday begins with the Seder meal where the Exodus story is retold using the Haggadah. Throughout the 8-day festival (7 days in Israel), Jews refrain from eating leavened bread and eat matzah instead.";
      
      case 'Shavuot':
        return "Shavuot marks the giving of the Torah at Mount Sinai. It's celebrated by all-night Torah study, reading the Book of Ruth, and eating dairy foods. The holiday also has agricultural significance as the time of the wheat harvest and first fruits in ancient Israel.";
      
      case 'Rosh Chodesh':
        return "Rosh Chodesh marks the beginning of each new month in the Jewish calendar. It's a minor holiday traditionally considered special for women. Some people recite additional prayers including Hallel, and in Temple times special sacrifices were offered.";
      
      default:
        return `Today is ${date.specialDay}, a special day in the Jewish calendar.`;
    }
  } catch (error) {
    console.error('Error getting enhanced day info:', error);
    return "Information about today's significance in the Jewish calendar is not available.";
  }
};

// All public functions are already exported above
