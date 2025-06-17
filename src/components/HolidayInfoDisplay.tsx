import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getHolidayForDate, getShabbatTimesForDate, HolidayInfo } from '../services/aiService';

type HolidayInfoDisplayProps = {
  date: Date;
};

const HolidayInfoDisplay: React.FC<HolidayInfoDisplayProps> = ({ date }) => {
  const [loading, setLoading] = useState(true);
  const [holidayInfo, setHolidayInfo] = useState<any[] | null>(null);
  const [shabbatTimes, setShabbatTimes] = useState<{candles?: string, havdalah?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get holiday information for the selected date
        const holidays = await getHolidayForDate(date);
        setHolidayInfo(holidays);
        
        // Get Shabbat times for this week
        const times = await getShabbatTimesForDate(date);
        setShabbatTimes(times);
      } catch (err) {
        console.error('Error fetching holiday info:', err);
        setError('Failed to load holiday information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [date]);
  
  const formatDateString = (dateObj: Date): string => {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading holiday information...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!holidayInfo && !shabbatTimes) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No holiday information available for this date.</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.dateHeader}>{formatDateString(date)}</Text>
      
      {/* Display Shabbat times if available */}
      {shabbatTimes && (
        <View style={styles.shabbatContainer}>
          <Text style={styles.sectionTitle}>Shabbat Times</Text>
          {shabbatTimes.candles && (
            <Text style={styles.timeText}>
              Candle Lighting: <Text style={styles.timeHighlight}>{shabbatTimes.candles}</Text>
            </Text>
          )}
          {shabbatTimes.havdalah && (
            <Text style={styles.timeText}>
              Havdalah: <Text style={styles.timeHighlight}>{shabbatTimes.havdalah}</Text>
            </Text>
          )}
        </View>
      )}
      
      {/* Display holiday information if available */}
      {holidayInfo && holidayInfo.map((holiday) => (
        <View key={holiday.id || holiday.name} style={styles.holidayContainer}>
          <Text style={styles.holidayTitle}>{holiday.name}</Text>
          
          {holiday.hebrew && (
            <Text style={styles.hebrewText}>{holiday.hebrew}</Text>
          )}
          
          {holiday.description && (
            <Text style={styles.description}>{holiday.description}</Text>
          )}
          
          {/* Display enhanced information if available */}
          {holiday.enhanced && (
            <View style={styles.enhancedContainer}>
              <Text style={styles.enhancedTitle}>More About {holiday.enhanced.name}</Text>
              
              <Text style={styles.historyTitle}>Historical Context</Text>
              <Text style={styles.historyText}>{holiday.enhanced.historicalContext}</Text>
              
              <Text style={styles.traditionsTitle}>Key Traditions</Text>
              {holiday.enhanced.traditions.map((tradition: string, tIndex: number) => (
                <Text key={`trad-${tIndex}`} style={styles.traditionItem}>
                  • {tradition}
                </Text>
              ))}
              
              <Text style={styles.lawsTitle}>Important Laws</Text>
              {holiday.enhanced.laws.map((law: string, lIndex: number) => (
                <Text key={`law-${lIndex}`} style={styles.lawItem}>
                  • {law}
                </Text>
              ))}
              
              <Text style={styles.practicesTitle}>Modern Practices</Text>
              {holiday.enhanced.modernPractices.map((practice: string, pIndex: number) => (
                <Text key={`practice-${pIndex}`} style={styles.practiceItem}>
                  • {practice}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffeeee',
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#cc0000',
    fontSize: 16,
  },
  noDataContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 10,
  },
  noDataText: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
  },
  dateHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  shabbatContainer: {
    backgroundColor: '#e6f7ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0077cc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0077cc',
  },
  timeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timeHighlight: {
    fontWeight: 'bold',
    color: '#333',
  },
  holidayContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  holidayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
  },
  hebrewText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    color: '#444',
  },
  enhancedContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  enhancedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  historyText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
    color: '#444',
  },
  traditionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
    color: '#333',
  },
  traditionItem: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    paddingLeft: 8,
    color: '#444',
  },
  lawsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
    color: '#333',
  },
  lawItem: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    paddingLeft: 8,
    color: '#444',
  },
  practicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
    color: '#333',
  },
  practiceItem: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    paddingLeft: 8,
    color: '#444',
  },
});

export default HolidayInfoDisplay; 