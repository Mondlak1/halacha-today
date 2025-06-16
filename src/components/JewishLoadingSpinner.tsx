import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface JewishLoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const JewishLoadingSpinner: React.FC<JewishLoadingSpinnerProps> = ({
  size = 40,
  color,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color || (colors?.primary || '#8e6f3d'); // Fallback to default gold color
  
  // Animation values
  const rotation = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(starScale, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(starScale, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Map rotation value to degrees (0 to 360)
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Size calculations
  const containerSize = size;
  const starPointSize = containerSize * 0.4;
  const innerCircleSize = containerSize * 0.3;
  
  return (
    <View style={[
      styles.container,
      { width: containerSize, height: containerSize }
    ]}>
      {/* Spinning Star of David */}
      <Animated.View
        style={[
          styles.starContainer,
          {
            width: containerSize,
            height: containerSize,
            transform: [
              { rotate: spin },
              { scale: starScale }
            ],
          },
        ]}
      >
        {/* First triangle */}
        <View
          style={[
            styles.triangle,
            {
              borderBottomWidth: starPointSize,
              borderLeftWidth: starPointSize / 2,
              borderRightWidth: starPointSize / 2,
              borderBottomColor: spinnerColor,
            },
          ]}
        />
        
        {/* Second inverted triangle */}
        <View
          style={[
            styles.triangle,
            styles.invertedTriangle,
            {
              borderBottomWidth: starPointSize,
              borderLeftWidth: starPointSize / 2,
              borderRightWidth: starPointSize / 2,
              borderBottomColor: spinnerColor,
            },
          ]}
        />
      </Animated.View>
      
      {/* Inner circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerCircleSize,
            height: innerCircleSize,
            backgroundColor: colors?.background || '#f9f5e9',
            borderColor: spinnerColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  invertedTriangle: {
    transform: [{ rotate: '180deg' }],
  },
  innerCircle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Default export
export default JewishLoadingSpinner; 