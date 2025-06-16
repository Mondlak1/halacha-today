import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Modal,
  Pressable,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, ThemeMode } from '../contexts/ThemeContext';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabel = false, 
  size = 24 
}) => {
  const { themeMode, setThemeMode, isDark } = useThemeContext();
  const { colors, spacing } = useTheme();
  const [modalVisible, setModalVisible] = React.useState(false);

  // Get icon based on current theme
  const getThemeIcon = () => {
    if (themeMode === 'system') {
      return isDark ? 'moon' : 'sunny';
    }
    return themeMode === 'dark' ? 'moon' : 'sunny';
  };

  // Theme options for the modal
  const themeOptions: {mode: ThemeMode; label: string; icon: string}[] = [
    { mode: 'light', label: 'Light', icon: 'sunny' },
    { mode: 'dark', label: 'Dark', icon: 'moon' },
    { mode: 'system', label: 'System', icon: 'phone-portrait-outline' }
  ];

  return (
    <>
      <TouchableOpacity
        style={[styles.toggleButton, { borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Toggle theme"
        accessibilityHint="Switches between light, dark, and system theme modes"
      >
        <Ionicons 
          name={getThemeIcon() as any} 
          size={size} 
          color={colors.text} 
        />
        {showLabel && (
          <Text style={[styles.toggleText, { color: colors.text, marginLeft: spacing.s }]}>
            {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Theme Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
              }
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Theme
            </Text>

            {themeOptions.map(option => (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.themeOption,
                  themeMode === option.mode && {
                    backgroundColor: colors.primary + '33', // Add transparency
                    borderColor: colors.primary,
                  }
                ]}
                onPress={() => {
                  setThemeMode(option.mode);
                  setModalVisible(false);
                }}
              >
                <Ionicons 
                  name={option.icon as any}
                  size={24}
                  color={themeMode === option.mode ? colors.primary : colors.text}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: themeMode === option.mode ? colors.primary : colors.text }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
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
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ThemeToggle; 