import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getPrayerTimes, getCurrentHebrewDate } from '../services/hebrewDate';

const defaultLocations = [
  { name: 'Jerusalem', latitude: 31.778, longitude: 35.2354 },
  { name: 'New York', latitude: 40.7128, longitude: -74.006 },
  { name: 'London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Tel Aviv', latitude: 32.0853, longitude: 34.7818 },
];

const ZmanimScreen = () => {
  const { colors } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState(defaultLocations[0]);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [prayerTimes, setPrayerTimes] = useState({ shacharis: '', mincha: '', maariv: '' });
  const [hebrewDate, setHebrewDate] = useState<any>(null);

  useEffect(() => {
    setHebrewDate(getCurrentHebrewDate());
    setPrayerTimes(getPrayerTimes());
  }, [selectedLocation]);

  const handleLocationSelect = (loc: typeof defaultLocations[0]) => {
    setSelectedLocation(loc);
    setShowLocationInput(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Location Selector in BlurView */}
        <BlurView intensity={50} tint="light" style={styles.glassCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={22} color={colors.primary} />
            <Text style={[styles.locationTitle, { color: colors.text }]}>Location</Text>
            <TouchableOpacity onPress={() => setShowLocationInput(!showLocationInput)}>
              <Ionicons name={showLocationInput ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {showLocationInput ? (
            <View style={styles.locationList}>
              {defaultLocations.map((loc) => (
                <TouchableOpacity key={loc.name} style={styles.locationItem} onPress={() => handleLocationSelect(loc)}>
                  <Text style={[styles.locationText, { color: colors.text }]}>{loc.name}</Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={[styles.locationInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Enter custom location (city)"
                placeholderTextColor={colors.textSecondary}
                value={customLocation}
                onChangeText={setCustomLocation}
                onSubmitEditing={() => {
                  if (customLocation.trim()) {
                    setSelectedLocation({ name: customLocation, latitude: 0, longitude: 0 });
                    setShowLocationInput(false);
                  }
                }}
              />
            </View>
          ) : (
            <Text style={[styles.selectedLocation, { color: colors.primary }]}>{selectedLocation.name}</Text>
          )}
        </BlurView>
        {/* Zmanim in BlurView */}
        <BlurView intensity={40} tint="light" style={styles.glassCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Zmanim</Text>
          <View style={styles.zmanimList}>
            <View style={styles.zmanimItem}>
              <Text style={[styles.zmanimLabel, { color: colors.secondary }]}>Shacharit:</Text>
              <Text style={[styles.zmanimValue, { color: colors.text }]}>{prayerTimes.shacharis}</Text>
            </View>
            <View style={styles.zmanimItem}>
              <Text style={[styles.zmanimLabel, { color: colors.secondary }]}>Mincha:</Text>
              <Text style={[styles.zmanimValue, { color: colors.text }]}>{prayerTimes.mincha}</Text>
            </View>
            <View style={styles.zmanimItem}>
              <Text style={[styles.zmanimLabel, { color: colors.secondary }]}>Maariv:</Text>
              <Text style={[styles.zmanimValue, { color: colors.text }]}>{prayerTimes.maariv}</Text>
            </View>
            {/* Add more zmanim as needed */}
          </View>
        </BlurView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  glassCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  selectedLocation: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  locationList: {
    marginTop: 8,
  },
  locationItem: {
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 16,
  },
  locationInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  zmanimList: {
    marginTop: 8,
  },
  zmanimItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  zmanimLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  zmanimValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ZmanimScreen; 