import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Activity, UserPreferences, DayType } from '../types/data';
import { 
  getCurrentHebrewDate, 
  getPrayerTimes, 
  getUpcomingSpecialDays 
} from './hebrewDate';

// Constants for notification IDs
const NOTIFICATION_IDS_KEY = 'halacha_notification_ids';
const PRAYER_NOTIFICATION_PREFIX = 'prayer_';
const ACTIVITY_NOTIFICATION_PREFIX = 'activity_';
const SPECIAL_DAY_NOTIFICATION_PREFIX = 'special_';

// Types for notification scheduling
interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface ScheduledNotification {
  id: string;
  date: Date;
  data: NotificationData;
}

// Initialize notifications configuration
export const initializeNotifications = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Notifications are only supported on physical devices');
    return false;
  }

  try {
    // Configure how notifications are handled when app is foregrounded
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false, // Disable badge in Expo Go
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request permissions
    const permissionResult = await requestNotificationPermissions();
    
    // Log warning about Expo Go limitations
    if (permissionResult) {
      console.log('Note: Some notification features may be limited in Expo Go. For full functionality, please use a development build.');
    }
    
    return permissionResult;
  } catch (error) {
    console.log('Limited notification support in Expo Go:', error);
    return false;
  }
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // Set up Android notification channels
    if (Platform.OS === 'android') {
      await setupAndroidNotificationChannels();
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Set up Android notification channels
const setupAndroidNotificationChannels = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('prayers', {
        name: 'Prayer Times',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9F1C',
      });

      await Notifications.setNotificationChannelAsync('activities', {
        name: 'Activity Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2EC4B6',
      });

      await Notifications.setNotificationChannelAsync('special-days', {
        name: 'Shabbat & Holidays',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E71D36',
      });
    } catch (error) {
      console.error('Error setting up notification channels:', error);
    }
  }
};

// Store notification ID for later cancellation if needed
const storeNotificationId = async (id: string): Promise<void> => {
  try {
    const existingIdsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    let notificationIds: string[] = [];
    
    if (existingIdsJson) {
      notificationIds = JSON.parse(existingIdsJson);
    }
    
    if (!notificationIds.includes(id)) {
      notificationIds.push(id);
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(notificationIds));
    }
  } catch (error) {
    console.error('Error storing notification ID:', error);
  }
};

// Helper function to ensure we have a Date object
const ensureDate = (input: string | Date): Date => {
  if (input instanceof Date) {
    return input;
  }
  return new Date(input);
};

// Helper function to parse time string to Date
const parseTimeToDate = (timeStr: string, baseDate: Date): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Helper function to adjust time based on user preference
const adjustTimeByUserPreference = (date: Date, reminderTime: string): Date => {
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const adjustedDate = new Date(date);
  adjustedDate.setHours(hours, minutes, 0, 0);
  return adjustedDate;
};

// Schedule a notification
export const scheduleNotification = async (
  notification: NotificationData,
  date: Date | string,
  repeat?: boolean
): Promise<string | null> => {
  try {
    // First check if we have notification permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot schedule notification: permission not granted');
      return null;
    }

    // Ensure we have a Date object
    const notificationDate = ensureDate(date);

    // Calculate seconds from now until the notification date
    const seconds = Math.floor((notificationDate.getTime() - Date.now()) / 1000);
    if (seconds <= 0) {
      console.log('Cannot schedule notification in the past');
      return null;
    }

    // Determine Android channel based on notification ID prefix
    let channelId = 'default';
    if (notification.id.startsWith(PRAYER_NOTIFICATION_PREFIX)) {
      channelId = 'prayers';
    } else if (notification.id.startsWith(ACTIVITY_NOTIFICATION_PREFIX)) {
      channelId = 'activities';
    } else if (notification.id.startsWith(SPECIAL_DAY_NOTIFICATION_PREFIX)) {
      channelId = 'special-days';
    }

    try {
      // Schedule the notification
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
          badge: 1,
        },
        trigger: {
          seconds: seconds,
          repeats: repeat || false,
          channelId: Platform.OS === 'android' ? channelId : undefined,
        },
        identifier: notification.id,
      });
      
      // Store the notification ID for later reference
      await storeNotificationId(identifier);
      
      return identifier;
    } catch (error) {
      console.log('Failed to schedule notification (may be limited in Expo Go):', error);
      return null;
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Cancel a notification by ID
export const cancelNotification = async (id: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    
    // Remove this ID from storage
    const existingIdsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (existingIdsJson) {
      let notificationIds: string[] = JSON.parse(existingIdsJson);
      notificationIds = notificationIds.filter(notifId => notifId !== id);
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(notificationIds));
    }
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

// Cancel all notifications
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// Schedule prayer time notifications using user preferences
export const schedulePrayerNotifications = async (
  userPrefs: UserPreferences,
  daysInAdvance: number = 7
): Promise<void> => {
  try {
    // Only schedule if notifications are enabled
    if (!userPrefs.notifications) return;
    
    // Cancel any existing prayer notifications
    await cancelPrayerNotifications();
    
    const today = new Date();
    
    // Schedule for the next X days
    for (let i = 0; i < daysInAdvance; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Get prayer times for this date
      const prayerTimes = getPrayerTimes(date);
      
      // Get the Hebrew date info to check if it's Shabbat/Holiday
      const hebrewDate = getCurrentHebrewDate(date);
      
      // Parse the time strings into Date objects
      const shacharitTime = parseTimeToDate(prayerTimes.shacharis, date);
      const minchaTime = parseTimeToDate(prayerTimes.mincha, date);
      const maarivTime = parseTimeToDate(prayerTimes.maariv, date);
      
      // Apply user's preferred reminder times
      const shacharitReminder = adjustTimeByUserPreference(
        shacharitTime, 
        userPrefs.reminderTimes.shacharis
      );
      
      const minchaReminder = adjustTimeByUserPreference(
        minchaTime, 
        userPrefs.reminderTimes.mincha
      );
      
      const maarivReminder = adjustTimeByUserPreference(
        maarivTime, 
        userPrefs.reminderTimes.maariv
      );
      
      // Create notification IDs with date to make them unique
      const dateStr = date.toISOString().split('T')[0];
      
      // Schedule notifications if they're enabled in preferences
      if (userPrefs.notifications) {
        await scheduleNotification(
          {
            id: `${PRAYER_NOTIFICATION_PREFIX}shacharis_${dateStr}`,
            title: 'Shacharit Time',
            body: `It's time for Shacharit prayer.`,
            data: { type: 'prayer', prayer: 'shacharis' },
          },
          shacharitReminder
        );
      }
      
      if (userPrefs.notifications) {
        await scheduleNotification(
          {
            id: `${PRAYER_NOTIFICATION_PREFIX}mincha_${dateStr}`,
            title: 'Mincha Time',
            body: `It's time for Mincha prayer.`,
            data: { type: 'prayer', prayer: 'mincha' },
          },
          minchaReminder
        );
      }
      
      if (userPrefs.notifications) {
        await scheduleNotification(
          {
            id: `${PRAYER_NOTIFICATION_PREFIX}maariv_${dateStr}`,
            title: 'Maariv Time',
            body: `It's time for Maariv prayer.`,
            data: { type: 'prayer', prayer: 'maariv' },
          },
          maarivReminder
        );
      }
    }
  } catch (error) {
    console.error('Error scheduling prayer notifications:', error);
  }
};

// Schedule special day notifications (Shabbat, holidays)
export const scheduleSpecialDayNotifications = async (
  userPrefs: UserPreferences,
  daysInAdvance: number = 30
): Promise<void> => {
  try {
    // Only schedule if notifications are enabled
    if (!userPrefs.notifications) return;
    
    // Cancel any existing special day notifications
    await cancelSpecialDayNotifications();
    
    // Get upcoming special days
    const specialDays = getUpcomingSpecialDays(daysInAdvance);
    const now = new Date();
    
    for (const specialDay of specialDays) {
      // Skip if this day doesn't have candle lighting times
      if (!specialDay.candles) continue;
      
      const dayType = specialDay.dayType === 'shabbat' ? 'Shabbat' : 'Holiday';
      const dateString = specialDay.gregorianDate.toISOString().split('T')[0];
      
      // Notification for candle lighting
      if (specialDay.candles.lighting) {
        const candleTime = parseTimeToDate(
          specialDay.candles.lighting, 
          specialDay.gregorianDate
        );
        
        // Set reminder 1 hour before candle lighting
        const reminderTime = new Date(candleTime);
        reminderTime.setHours(reminderTime.getHours() - 1);
        
        if (reminderTime > now) {
          await scheduleNotification(
            {
              id: `${SPECIAL_DAY_NOTIFICATION_PREFIX}candles_${dateString}`,
              title: `${dayType} Candle Lighting Reminder`,
              body: `${dayType} begins tonight at ${specialDay.candles.lighting}. Don't forget to light candles!`,
              data: { 
                type: 'special_day', 
                name: specialDay.specialDay || dayType, 
                time: specialDay.candles.lighting 
              }
            },
            reminderTime
          );
        }
      }
      
      // Notification for havdalah
      if (specialDay.candles.havdalah) {
        const havdalahTime = parseTimeToDate(
          specialDay.candles.havdalah, 
          new Date(specialDay.gregorianDate.getTime() + 24 * 60 * 60 * 1000) // Next day
        );
        
        if (havdalahTime > now) {
          await scheduleNotification(
            {
              id: `${SPECIAL_DAY_NOTIFICATION_PREFIX}havdalah_${dateString}`,
              title: `${dayType} is ending`,
              body: `${dayType} ends tonight at ${specialDay.candles.havdalah}. Havdalah can be recited after this time.`,
              data: { 
                type: 'special_day', 
                name: specialDay.specialDay || dayType, 
                time: specialDay.candles.havdalah 
              }
            },
            havdalahTime
          );
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling special day notifications:', error);
  }
};

// Schedule activity notifications
export const scheduleActivityNotifications = async (
  activity: Activity,
  date: Date | string,
  userPrefs: UserPreferences
): Promise<void> => {
  try {
    // Only schedule if notifications are enabled
    if (!userPrefs.notifications) return;

    // Convert input date to Date object
    const notificationDate = ensureDate(date);
    
    // Format date string for the notification ID
    const dateStr = notificationDate.toISOString().split('T')[0];

    await scheduleNotification(
      {
        id: `${ACTIVITY_NOTIFICATION_PREFIX}${activity.id}_${dateStr}`,
        title: activity.title,
        body: `Reminder: ${activity.description}`,
        data: { type: 'activity', activityId: activity.id },
      },
      notificationDate
    );
  } catch (error) {
    console.error('Error scheduling activity notification:', error);
  }
};

// Cancel all prayer notifications
export const cancelPrayerNotifications = async (): Promise<void> => {
  try {
    const existingIdsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!existingIdsJson) return;
    
    const notificationIds: string[] = JSON.parse(existingIdsJson);
    const prayerNotificationIds = notificationIds.filter(id => 
      id.startsWith(PRAYER_NOTIFICATION_PREFIX)
    );
    
    // Cancel each prayer notification
    for (const id of prayerNotificationIds) {
      await cancelNotification(id);
    }
    
    // Update the stored IDs list
    const updatedIds = notificationIds.filter(id => !id.startsWith(PRAYER_NOTIFICATION_PREFIX));
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(updatedIds));
  } catch (error) {
    console.error('Error canceling prayer notifications:', error);
  }
};

// Cancel all special day notifications
export const cancelSpecialDayNotifications = async (): Promise<void> => {
  try {
    const existingIdsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!existingIdsJson) return;
    
    const notificationIds: string[] = JSON.parse(existingIdsJson);
    const specialDayNotificationIds = notificationIds.filter(id => 
      id.startsWith(SPECIAL_DAY_NOTIFICATION_PREFIX)
    );
    
    // Cancel each special day notification
    for (const id of specialDayNotificationIds) {
      await cancelNotification(id);
    }
    
    // Update the stored IDs list
    const updatedIds = notificationIds.filter(id => !id.startsWith(SPECIAL_DAY_NOTIFICATION_PREFIX));
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(updatedIds));
  } catch (error) {
    console.error('Error canceling special day notifications:', error);
  }
};

// Cancel all activity-specific notifications
export const cancelActivityNotifications = async (activityId?: string): Promise<void> => {
  try {
    const existingIdsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!existingIdsJson) return;
    
    const notificationIds: string[] = JSON.parse(existingIdsJson);
    
    // If activityId is provided, only cancel notifications for that activity
    const activityNotificationIds = notificationIds.filter(id => {
      if (!id.startsWith(ACTIVITY_NOTIFICATION_PREFIX)) return false;
      if (activityId) {
        // Check if the ID contains the specific activity ID
        return id.includes(`${ACTIVITY_NOTIFICATION_PREFIX}${activityId}_`);
      }
      return true;
    });
    
    // Cancel each activity notification
    for (const id of activityNotificationIds) {
      await cancelNotification(id);
    }
    
    // Update the stored IDs list
    const updatedIds = activityId 
      ? notificationIds.filter(id => !activityNotificationIds.includes(id))
      : notificationIds.filter(id => !id.startsWith(ACTIVITY_NOTIFICATION_PREFIX));
      
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(updatedIds));
  } catch (error) {
    console.error('Error canceling activity notifications:', error);
  }
};

// Helper function to get all currently scheduled notifications
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Check if notifications are enabled in the app
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const userPrefsJson = await AsyncStorage.getItem('user_preferences');
    if (userPrefsJson) {
      const userPrefs = JSON.parse(userPrefsJson) as UserPreferences;
      return userPrefs.notifications;
    }
    return false;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
};

// Setup all notifications based on current preferences
export const setupAllNotifications = async (): Promise<void> => {
  try {
    const userPrefsJson = await AsyncStorage.getItem('user_preferences');
    if (!userPrefsJson) return;
    
    const userPrefs = JSON.parse(userPrefsJson) as UserPreferences;
    
    // Only proceed if notifications are enabled
    if (!userPrefs.notifications) {
      await cancelAllNotifications();
      return;
    }
    
    // Schedule prayer notifications for next 7 days
    await schedulePrayerNotifications(userPrefs, 7);
    
    // Schedule special day notifications for next 30 days
    await scheduleSpecialDayNotifications(userPrefs, 30);
    
    // Custom reminders are scheduled separately as they're created
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
};

// Determine if we need to reschedule notifications based on app updates or time passing
export const checkAndRescheduleNotifications = async (): Promise<void> => {
  try {
    const lastUpdateJson = await AsyncStorage.getItem('last_notification_update');
    const now = new Date();
    
    // Default to 7 days ago if not set
    let lastUpdate = new Date(now);
    lastUpdate.setDate(lastUpdate.getDate() - 7);
    
    if (lastUpdateJson) {
      lastUpdate = new Date(JSON.parse(lastUpdateJson));
    }
    
    // If it's been more than 24 hours since last update, reschedule
    const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastUpdate > 24) {
      await setupAllNotifications();
      await AsyncStorage.setItem('last_notification_update', JSON.stringify(now));
    }
  } catch (error) {
    console.error('Error checking notification schedule:', error);
  }
};

// Set up notification listener for handling notification taps
export const setupNotificationListener = (
  onNotificationReceived: (notification: Notifications.Notification) => void
): () => void => {
  const subscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
  return () => subscription.remove();
};

// Set up notification response listener for handling user interaction
export const setupNotificationResponseListener = (
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
): () => void => {
  const subscription = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
  return () => subscription.remove();
};
