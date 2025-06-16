import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { DailyActivitiesList } from '../components/DailyActivitiesList';
import { colors } from '../styles/colors';
import { styles } from '../styles/styles';

const HomeScreen = () => {
  const [hebrewDate, setHebrewDate] = useState(null);

  useEffect(() => {
    // Implement the logic to fetch the Hebrew date
    // This is a placeholder and should be replaced with the actual implementation
    setHebrewDate({ dayType: 'regular' });
  }, []);

  return (
    <View style={styles.container}>
      {/* Appropriate Activities for Today */}
      <View style={styles.activitiesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Activities for Today
        </Text>
        
        <DailyActivitiesList 
          limit={5} 
          showViewAll={true}
          filter={(activity) => activity.statusByDay?.[hebrewDate?.dayType || 'regular'] !== 'forbidden'}
        />
      </View>
    </View>
  );
};

export default HomeScreen; 