import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ActivityStatus } from '../types/data';
import { useTheme } from '../hooks/useTheme';

interface StatusBadgeProps {
  status: ActivityStatus;
  size?: 'small' | 'medium' | 'large';
  customText?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'medium',
  customText
}) => {
  const { colors } = useTheme();
  
  const getStatusInfo = () => {
    switch (status) {
      case 'allowed':
        return { 
          text: customText || 'Permitted', 
          color: colors.success 
        };
      case 'conditional':
        return { 
          text: customText || 'Conditional', 
          color: colors.warning 
        };
      case 'forbidden':
        return { 
          text: customText || 'Forbidden', 
          color: colors.error 
        };
      default:
        return { 
          text: customText || 'Unknown', 
          color: colors.text 
        };
    }
  };
  
  const { text, color } = getStatusInfo();
  
  const sizeStyles = {
    small: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontSize: 10,
      borderRadius: 8,
      lineHeight: 12,
    },
    medium: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 12,
      borderRadius: 12,
      lineHeight: 14,
    },
    large: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 14,
      borderRadius: 16,
      lineHeight: 16,
    },
  };
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: color + '20',
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
          borderRadius: sizeStyles[size].borderRadius,
          ...Platform.select({
            ios: {
              shadowColor: color,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            },
            android: {
              elevation: 2,
            },
          }),
        }
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { 
            color: color,
            fontSize: sizeStyles[size].fontSize,
            lineHeight: sizeStyles[size].lineHeight,
          }
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StatusBadge;
