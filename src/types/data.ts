export type CustomType = 'Ashkenazi' | 'Sephardi';

export interface UserPreferences {
  custom: CustomType;
  notifications: boolean;
  reminderTimes: {
    shacharis: string; // HH:MM format
    mincha: string;
    maariv: string;
    other: Array<{
      id: string;
      name: string;
      time: string;
    }>;
  };
}

export type ActivityStatus = 'allowed' | 'forbidden' | 'conditional';

export type DayType = 'regular' | 'shabbat' | 'yomTov' | 'fastDay' | 'roshChodesh';
export type ActivityCategory = 
  | 'Shabbat & Holidays' 
  | 'Daily' 
  | 'Food & Kashrut' 
  | 'Holidays' 
  | 'Lifecycle' 
  | 'Daily Practices' 
  | 'Lifecycle Events'
  | 'Religious'
  | 'Food & Drink'
  | 'Personal Hygiene'
  | 'Social & Home'
  | 'Professional'
  | 'Shopping & Money'
  | 'Travel & Mobility'
  | 'Personal Life'
  | 'Special Days';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  isPermitted: boolean;
  notes: string;
  defaultStatus: ActivityStatus;
  statusByDay: {
    regular: ActivityStatus;
    shabbat: ActivityStatus;
    yomTov: ActivityStatus;
    fastDay: ActivityStatus;
    roshChodesh?: ActivityStatus;
  };
  explanation: {
    regular: string;
    shabbat: string;
    yomTov: string;
    fastDay: string;
    roshChodesh?: string;
  };
  customVariation: {
    ashkenazi?: Partial<{
      statusByDay: Partial<Record<DayType, ActivityStatus>>;
      explanation: Partial<Record<DayType, string>>;
    }>;
    sephardi?: Partial<{
      statusByDay: Partial<Record<DayType, ActivityStatus>>;
      explanation: Partial<Record<DayType, string>>;
    }>;
  };
  sources: Array<{
    text: string;
    reference: string;
  }>;
  relatedActivities: string[]; // IDs of related activities
}

export interface JewishDate {
  hebrewDay: number;
  hebrewMonth: number;
  hebrewYear: number;
  hebrewMonthName?: string;
  hebrewDateString?: string;
  gregorianDate: Date | string;
  dayType: DayType;
  specialDay?: string | null;
  dafYomi?: string;
  candles?: {
    lighting?: string;
    havdalah?: string;
  } | null;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // ISO date string
  description?: string;
  category: 'major' | 'minor' | 'fast' | 'modern';
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  candles?: {
    lighting?: string;
    havdalah?: string;
  };
  observed: boolean;
  imageUrl?: string;
}

