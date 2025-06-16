import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Activity, CustomType, DayType } from '../types/data';
import { getActivityById } from '../services/activities';
import { getHalachicExplanation } from '../services/groqService';

interface ActivityDetailsProps {
  activityId: string;
  dayType?: DayType;
  tradition?: CustomType;
}

const ActivityDetails: React.FC<ActivityDetailsProps> = ({
  activityId,
  dayType = 'regular',
  tradition = 'Ashkenazi'
}) => {
  const { colors, spacing } = useTheme();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showAiExplanation, setShowAiExplanation] = useState(false);
  
  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        const activityData = await getActivityById(activityId);
        setActivity(activityData);
      } catch (error) {
        console.error('Error loading activity:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivity();
  }, [activityId]);
  
  const getActivityStatus = () => {
    if (!activity) return null;
    
    // Check for custom tradition variation
    const customVariation = tradition.toLowerCase() === 'ashkenazi' ? 
      activity.customVariation?.ashkenazi : 
      activity.customVariation?.sephardi;
    
    // If there's a custom status for this day type and tradition, use it
    if (customVariation?.statusByDay?.[dayType]) {
      return customVariation.statusByDay[dayType];
    }
    
    // Otherwise use the default status for this day type
    return activity.statusByDay[dayType] || activity.defaultStatus;
  };
  
  const getStatusColor = (status: string | null) => {
    if (!status) return colors.text;
    
    switch (status) {
      case 'allowed':
        return colors.allowed;
      case 'forbidden':
        return colors.forbidden;
      case 'conditional':
        return colors.conditional;
      default:
        return colors.text;
    }
  };
  
  const getExplanation = () => {
    if (!activity) return '';
    
    // Check for custom tradition variation
    const customVariation = tradition.toLowerCase() === 'ashkenazi' ? 
      activity.customVariation?.ashkenazi : 
      activity.customVariation?.sephardi;
    
    // If there's a custom explanation for this day type and tradition, use it
    if (customVariation?.explanation?.[dayType]) {
      return customVariation.explanation[dayType] || '';
    }
    
    // Otherwise use the default explanation for this day type
    return activity.explanation[dayType] || '';
  };
  
  const loadAiExplanation = async () => {
    if (!activity || loadingExplanation || aiExplanation) return;
    
    try {
      setLoadingExplanation(true);
      const explanation = await getHalachicExplanation(
        activity.title,
        tradition
      );
      setAiExplanation(explanation);
      setShowAiExplanation(true);
    } catch (error) {
      console.error('Error loading AI explanation:', error);
    } finally {
      setLoadingExplanation(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading activity details...
        </Text>
      </View>
    );
  }
  
  if (!activity) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          Activity not found
        </Text>
      </View>
    );
  }
  
  const activityStatus = getActivityStatus();
  const statusColor = getStatusColor(activityStatus);
  const explanation = getExplanation();
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {activity.title}
        </Text>
        
        <View style={styles.statusContainer}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Status:
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {activityStatus 
                ? activityStatus.charAt(0).toUpperCase() + activityStatus.slice(1)
                : 'Unknown'}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.description, { color: colors.text }]}>
          {activity.description}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          On {dayType.charAt(0).toUpperCase() + dayType.slice(1)} Days
        </Text>
        
        <Text style={[styles.explanationText, { color: colors.text }]}>
          {explanation}
        </Text>
      </View>
      
      {activity.notes && (
        <View style={[styles.notesContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.notesTitle, { color: colors.primary }]}>
            Important Notes:
          </Text>
          <Text style={[styles.notesText, { color: colors.text }]}>
            {activity.notes}
          </Text>
        </View>
      )}
      
      {activity.sources && activity.sources.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sources
          </Text>
          
          {activity.sources.map((source, index) => (
            <View key={index} style={styles.sourceItem}>
              <Text style={[styles.sourceText, { color: colors.text }]}>
                {source.text} - <Text style={{ fontStyle: 'italic' }}>{source.reference}</Text>
              </Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.aiButton, { borderColor: colors.primary }]}
          onPress={loadAiExplanation}
          disabled={loadingExplanation || !showAiExplanation && !!aiExplanation}
        >
          {loadingExplanation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons 
                name={showAiExplanation && aiExplanation ? "chevron-up" : "bulb"} 
                size={18} 
                color={colors.primary} 
              />
              <Text style={[styles.aiButtonText, { color: colors.primary }]}>
                {showAiExplanation && aiExplanation 
                  ? "Hide Enhanced Explanation" 
                  : aiExplanation 
                    ? "Show Enhanced Explanation" 
                    : "Get Enhanced Explanation"}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {showAiExplanation && aiExplanation && (
          <View style={[styles.aiContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.aiExplanationTitle, { color: colors.primary }]}>
              AI-Enhanced Explanation
            </Text>
            <Text style={[styles.aiExplanationText, { color: colors.text }]}>
              {aiExplanation}
            </Text>
            <Text style={[styles.aiDisclaimer, { color: colors.textSecondary }]}>
              This explanation was generated by AI and should be verified with a rabbi or trusted source.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  notesContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  sourceItem: {
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  aiContainer: {
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  aiExplanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aiExplanationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  aiDisclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default ActivityDetails; 