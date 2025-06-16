import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { importHolidayData } from '../services/aiService';

type DataImportButtonProps = {
  onComplete?: () => void;
};

const DataImportButton: React.FC<DataImportButtonProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      setLoading(true);
      setStatus('Starting import...');

      // Show confirmation dialog
      Alert.alert(
        'Import Calendar Data',
        'This will download Jewish calendar data and generate enhanced information using AI. It may take a few minutes. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setLoading(false);
              setStatus(null);
            },
          },
          {
            text: 'Import',
            onPress: async () => {
              try {
                setStatus('Downloading calendar data...');
                // Current year + next year
                const currentYear = new Date().getFullYear();
                
                // Import current year
                setStatus(`Importing data for ${currentYear}...`);
                const success = await importHolidayData(currentYear);
                
                if (success) {
                  // Import next year
                  setStatus(`Importing data for ${currentYear + 1}...`);
                  await importHolidayData(currentYear + 1);
                  
                  setStatus('Import completed successfully!');
                  if (onComplete) {
                    onComplete();
                  }
                } else {
                  setStatus('Error importing data. Please try again.');
                }
              } catch (error) {
                console.error('Import error:', error);
                setStatus('Error importing data. Please try again.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Import setup error:', error);
      setStatus('Error setting up import. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Import Calendar Data" 
        onPress={handleImport}
        disabled={loading}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}
      
      {!loading && status && (
        <Text style={[
          styles.statusText, 
          status.includes('Error') ? styles.errorText : styles.successText
        ]}>
          {status}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 10,
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  statusText: {
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
  },
  successText: {
    color: 'green',
  },
});

export default DataImportButton; 