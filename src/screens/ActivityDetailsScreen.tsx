import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import ActivityDetails from '../components/ActivityDetails';

type ActivityDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ActivityDetails'>;
type ActivityDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ActivityDetailsScreenProps {
  route: ActivityDetailsScreenRouteProp;
  navigation: ActivityDetailsScreenNavigationProp;
}

const ActivityDetailsScreen: React.FC<ActivityDetailsScreenProps> = ({ route }) => {
  const { colors } = useTheme();
  const { activityId } = route.params;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityDetails 
        activityId={activityId} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ActivityDetailsScreen; 