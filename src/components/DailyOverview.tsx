import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface DailyOverviewProps {
  hebrewDate: string;
  gregorianDate: string;
  parasha?: string;
  omerCount?: number;
  isShabbat: boolean;
  isYomTov: boolean;
  isFastDay: boolean;
  minorHoliday?: string;
}

const DailyOverview: React.FC<DailyOverviewProps> = ({
  hebrewDate,
  gregorianDate,
  parasha,
  omerCount,
  isShabbat,
  isYomTov,
  isFastDay,
  minorHoliday,
}) => {
  const { colors } = useTheme();

  return (
    <BlurView intensity={80} tint="light" style={[styles.container, { borderColor: 'rgba(255,255,255,0.45)' }]}>
      <LinearGradient
        colors={[colors.primary + '99', colors.secondary + '66', '#ffffff33']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.dateContainer}>
        <Text style={[styles.hebrewDate, { color: colors.text }]}>{hebrewDate}</Text>
        <Text style={[styles.gregorianDate, { color: colors.textSecondary }]}>{gregorianDate}</Text>
      </View>

      <View style={styles.statusContainer}>
        {isShabbat && (
          <View style={[styles.statusBadge, { backgroundColor: colors.shabbat + '20' }]}>
            <Ionicons name="moon" size={16} color={colors.shabbat} />
            <Text style={[styles.statusText, { color: colors.shabbat }]}>Shabbat</Text>
          </View>
        )}
        {isYomTov && (
          <View style={[styles.statusBadge, { backgroundColor: colors.yomTov + '20' }]}>
            <Ionicons name="star" size={16} color={colors.yomTov} />
            <Text style={[styles.statusText, { color: colors.yomTov }]}>Yom Tov</Text>
          </View>
        )}
        {isFastDay && (
          <View style={[styles.statusBadge, { backgroundColor: colors.fastDay + '20' }]}>
            <Ionicons name="water" size={16} color={colors.fastDay} />
            <Text style={[styles.statusText, { color: colors.fastDay }]}>Fast Day</Text>
          </View>
        )}
      </View>

      {(parasha || omerCount || minorHoliday) && (
        <View style={styles.detailsContainer}>
          {parasha && (
            <View style={styles.detailItem}>
              <Ionicons name="book" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.text }]}>{parasha}</Text>
            </View>
          )}
          {omerCount && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.text }]}>Day {omerCount} of the Omer</Text>
            </View>
          )}
          {minorHoliday && (
            <View style={styles.detailItem}>
              <Ionicons name="star" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.text }]}>{minorHoliday}</Text>
            </View>
          )}
        </View>
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1.5,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  hebrewDate: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gregorianDate: {
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
});

export default DailyOverview; 