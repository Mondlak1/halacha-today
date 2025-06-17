import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface ZmanimDisplayProps {
  candleLighting?: string;
  havdalah?: string;
  shema?: string;
  shacharit?: string;
  minchaGedola?: string;
  minchaKetana?: string;
  location?: string;
}

const zmanimMeta = [
  {
    key: 'candleLighting',
    label: 'Candle Lighting',
    icon: 'flame',
    color: '#FFD700', // gold
    bg: '#FFF8E1',
  },
  {
    key: 'havdalah',
    label: 'Havdalah',
    icon: 'moon',
    color: '#8e24aa', // purple
    bg: '#F3E5F5',
  },
  {
    key: 'shema',
    label: 'Latest Shema',
    icon: 'sunny',
    color: '#039be5', // blue
    bg: '#E1F5FE',
  },
  {
    key: 'shacharit',
    label: 'Latest Shacharit',
    icon: 'sunrise',
    color: '#43a047', // green
    bg: '#E8F5E9',
  },
  {
    key: 'minchaGedola',
    label: 'Mincha Gedola',
    icon: 'sunny',
    color: '#fb8c00', // orange
    bg: '#FFF3E0',
  },
  {
    key: 'minchaKetana',
    label: 'Mincha Ketana',
    icon: 'sunset',
    color: '#d84315', // deep orange
    bg: '#FBE9E7',
  },
];

const ZmanimDisplay: React.FC<ZmanimDisplayProps> = (props) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <BlurView intensity={90} tint="light" style={[styles.container, { borderColor: 'rgba(255,255,255,0.35)' }]}>  
        <LinearGradient
          colors={[colors.primary + '55', colors.secondary + '33', '#ffffff22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerRow}>
          <Ionicons name="time" size={32} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: colors.text }]}>Today's Zmanim</Text>
        </View>
        {props.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.location, { color: colors.textSecondary }]}>{props.location}</Text>
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zmanimScroll}>
          {zmanimMeta.map((meta) => {
            const value = (props as any)[meta.key];
            if (!value) return null;
            return (
              <View key={meta.key} style={[styles.zmanCard, { backgroundColor: meta.bg, borderColor: meta.color }]}> 
                <View style={[styles.zmanIconCircle, { backgroundColor: meta.color + '22' }]}> 
                  <Ionicons name={meta.icon as any} size={24} color={meta.color} />
                </View>
                <Text style={[styles.zmanLabel, { color: colors.textSecondary }]}>{meta.label}</Text>
                <Text style={[styles.zmanValue, { color: meta.color }]}>{value}</Text>
              </View>
            );
          })}
        </ScrollView>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1.5,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.13,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  location: {
    fontSize: 15,
    fontWeight: '500',
  },
  zmanimScroll: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 2,
  },
  zmanCard: {
    minWidth: 110,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.2,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    backgroundColor: '#fff',
  },
  zmanIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  zmanLabel: {
    fontSize: 13,
    marginBottom: 2,
    fontWeight: '500',
  },
  zmanValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default ZmanimDisplay; 