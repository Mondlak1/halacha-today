import { JewishCalendar, HebrewDateFormatter, JewishDate } from 'kosher-zmanim';
import { JewishDate as JewishDateType, DayType } from '../types/data';

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

// Jewish holidays and special days
const JEWISH_HOLIDAYS = {
  // Major holidays
  ROSH_HASHANA: 'Rosh Hashana',
  YOM_KIPPUR: 'Yom Kippur',
  SUKKOT: 'Sukkot',
  SHEMINI_ATZERET: 'Shemini Atzeret',
  SIMCHAT_TORAH: 'Simchat Torah',
  PESACH: 'Pesach',
  SHAVUOT: 'Shavuot',
  
  // Minor holidays
  CHANUKAH: 'Chanukah',
  PURIM: 'Purim',
  TU_BISHVAT: 'Tu BiShvat',
  LAG_BAOMER: 'Lag BaOmer',
  
  // Fast days
  TZOM_GEDALIAH: 'Tzom Gedaliah',
  TENTH_OF_TEVET: 'Tenth of Tevet',
  TAANIT_ESTHER: 'Taanit Esther',
  SEVENTEENTH_OF_TAMMUZ: 'Seventeenth of Tammuz',
  TISHA_BAV: 'Tisha B\'Av',
  
  // Other
  ROSH_CHODESH: 'Rosh Chodesh',
};

/**
 * Get the current Hebrew date
 */
export const getHebrewDate = async (): Promise<JewishDateType> => {
  const now = new Date();
  const jewishDate = new JewishDate(now);
  const formatter = new HebrewDateFormatter();
  formatter.setHebrewFormat(true);
  
  const hebrewDay = jewishDate.getJewishDayOfMonth();
  const hebrewMonth = jewishDate.getJewishMonth();
  const hebrewYear = jewishDate.getJewishYear();
  
  const formattedHebrewDate = formatter.formatHebrewNumber(hebrewDay);
  const formattedHebrewYear = formatter.formatHebrewNumber(hebrewYear);
  
  const specialDay = await getSpecialDay(now);
  const dayType = await getDayType(now);
  
  // Get candle lighting times if it's Shabbat or a holiday
  let candles = undefined;
  if (dayType === 'shabbat' || dayType === 'yomTov') {
    // Normally we would calculate actual candle lighting times
    // For this example, we'll use placeholders
    candles = {
      lighting: '19:30',
      havdalah: '20:32',
    };
  }
  
  return {
    hebrewDate: formattedHebrewDate,
    hebrewMonth: HEBREW_MONTH_NAMES[hebrewMonth - 1],
    hebrewYear: formattedHebrewYear,
    gregorianDate: now,
    dayType,
    specialDay: specialDay || undefined,
    candles,
  };
};

/**
 * Determine the day type (regular, Shabbat, holiday, etc.)
 */
export const getDayType = async (date: Date): Promise<DayType> => {
  const jewishCalendar = new JewishCalendar(date);
  
  // Check if it's Shabbat
  if (jewishCalendar.getDayOfWeek() === 7) {
    return 'shabbat';
  }
  
  // Check if it's a major holiday
  if (
    jewishCalendar.isYomTov() && 
    !jewishCalendar.isCholHamoed() && 
    !jewishCalendar.isRoshChodesh() && 
    !jewishCalendar.isChanukah() && 
    !jewishCalendar.isPurim()
  ) {
    return 'yomTov';
  }
  
  // Check if it's a fast day
  if (
    jewishCalendar.isYomKippur() || 
    jewishCalendar.isTaanisBechoros() || 
    jewishCalendar.isTishaBeav() || 
    jewishCalendar.isTaanis()
  ) {
    return 'fastDay';
  }
  
  // Check if it's Rosh Chodesh
  if (jewishCalendar.isRoshChodesh()) {
    return 'roshChodesh';
  }
  
  // Default to regular day
  return 'regular';
};

/**
 * Get the name of a special day if applicable
 */
export const getSpecialDay = async (date: Date): Promise<string | null> => {
  const jewishCalendar = new JewishCalendar(date);
  
  // Check for major holidays
  if (jewishCalendar.isRoshHashana()) {
    return JEWISH_HOLIDAYS.ROSH_HASHANA;
  } else if (jewishCalendar.isYomKippur()) {
    return JEWISH_HOLIDAYS.YOM_KIPPUR;
  } else if (jewishCalendar.isSukkos() && !jewishCalendar.isCholHamoed()) {
    return JEWISH_HOLIDAYS.SUKKOT;
  } else if (jewishCalendar.isSheminiAtzeres()) {
    return JEWISH_HOLIDAYS.SHEMINI_ATZERET;
  } else if (jewishCalendar.isSimchasTorah()) {
    return JEWISH_HOLIDAYS.SIMCHAT_TORAH;
  } else if (jewishCalendar.isPesach() && !jewishCalendar.isCholHamoed()) {
    return JEWISH_HOLIDAYS.PESACH;
  } else if (jewishCalendar.isShavuos()) {
    return JEWISH_HOLIDAYS.SHAVUOT;
  }
  
  // Check for minor holidays
  else if (jewishCalendar.isChanukah()) {
    return JEWISH_HOLIDAYS.CHANUKAH;
  } else if (jewishCalendar.isPurim()) {
    return JEWISH_HOLIDAYS.PURIM;
  } else if (
    jewishCalendar.getJewishMonth() === 11 && // Shevat
    jewishCalendar.getJewishDayOfMonth() === 15
  ) {
    return JEWISH_HOLIDAYS.TU_BISHVAT;
  } else if (
    jewishCalendar.getJewishMonth() === 2 && // Iyar
    jewishCalendar.getJewishDayOfMonth() === 18
  ) {
    return JEWISH_HOLIDAYS.LAG_BAOMER;
  }
  
  // Check for fast days
  else if (jewishCalendar.isTzomGedalia()) {
    return JEWISH_HOLIDAYS.TZOM_GEDALIAH;
  } else if (jewishCalendar.isAsaraBeTeves()) {
    return JEWISH_HOLIDAYS.TENTH_OF_TEVET;
  } else if (jewishCalendar.isTaanis() && jewishCalendar.isTaanisEsther()) {
    return JEWISH_HOLIDAYS.TAANIT_ESTHER;
  } else if (jewishCalendar.isShivaAsarBTammuz()) {
    return JEWISH_HOLIDAYS.SEVENTEENTH_OF_TAMMUZ;
  } else if (jewishCalendar.isTishaBeav()) {
    return JEWISH_HOLIDAYS.TISHA_BAV;
  }
  
  // Check for Rosh Chodesh
  else if (jewishCalendar.isRoshChodesh()) {
    return JEWISH_HOLIDAYS.ROSH_CHODESH;
  }
  
  // No special day
  return null;
};

/**
 * Get the upcoming holidays within a certain range
 */
export const getUpcomingHolidays = async (
  daysAhead: number = 30
): Promise<Array<{ date: Date; name: string; dayType: DayType }>> => {
  const holidays = [];
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    const specialDay = await getSpecialDay(date);
    const dayType = await getDayType(date);
    
    // Only include special days or Shabbat
    if (specialDay || dayType === 'shabbat') {
      holidays.push({
        date,
        name: specialDay || (dayType === 'shabbat' ? 'Shabbat' : ''),
        dayType,
      });
    }
  }
  
  return holidays;
};
