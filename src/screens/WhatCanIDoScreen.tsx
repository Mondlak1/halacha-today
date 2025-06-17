import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

const options = [
  { label: 'Shabbat', desc: '18 minutes after sunset' },
  { label: 'Yom Tov', desc: '18 minutes after sunset' },
  { label: 'Fast Day', desc: '18 minutes after sunset' },
  { label: 'Chol Hamoed', desc: '18 minutes after sunset' },
  { label: 'Rosh Chodesh', desc: '18 minutes after sunset' },
  { label: `Tisha B'Av`, desc: '18 minutes after sunset' },
  { label: 'Yom Kippur', desc: '18 minutes after sunset' },
  { label: 'Purim', desc: '18 minutes after sunset' },
  { label: 'Chanukah', desc: '18 minutes after sunset' },
  { label: `Lag B'Omer`, desc: '18 minutes after sunset' },
  { label: `Tu B'Shvat`, desc: '18 minutes after sunset' },
  { label: `Tu B'Av`, desc: '18 minutes after sunset' },
];

const WhatCanIDoScreen = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>What Can I Do?</Text>
      </View>
      <ScrollView>
        {options.map((opt, idx) => (
          <View key={opt.label} style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>{opt.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="help-circle" size={24} color={colors.text} />
          <Text style={[styles.navText, { color: colors.text }]}>What Can I Do?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f8fc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  headerIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginRight: 48 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f8fc', paddingHorizontal: 16, minHeight: 72, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ebe7f3' },
  optionTextContainer: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '500' },
  optionDesc: { fontSize: 14, color: '#644e97' },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ebe7f3', paddingTop: 8, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#f9f8fc' },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navText: { fontSize: 12, fontWeight: '500' },
});

export default WhatCanIDoScreen; 