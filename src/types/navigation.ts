import { DayType, CustomType } from './data';

export type RootStackParamList = {
  Main: { screen?: keyof MainTabParamList };
  ActivityDetails: { 
    activityId: string;
    activityName?: string;
    dayType?: DayType;
    tradition?: CustomType;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Activities: { category?: string };
  Settings: undefined;
};

/**
 * Types for notification data
 */
export type NotificationType = 'prayer' | 'activity' | 'special_day';

export interface BaseNotificationData {
  type: NotificationType;
}

export interface PrayerNotificationData extends BaseNotificationData {
  type: 'prayer';
  name: 'shacharit' | 'mincha' | 'maariv';
  time: string;
}

export interface ActivityNotificationData extends BaseNotificationData {
  type: 'activity';
  activityId: string;
  name?: string;
  dayType?: DayType;
  tradition?: CustomType;
}

export interface SpecialDayNotificationData extends BaseNotificationData {
  type: 'special_day';
  name: string;
  time: string;
}

export type NotificationData = 
  | PrayerNotificationData 
  | ActivityNotificationData 
  | SpecialDayNotificationData;
