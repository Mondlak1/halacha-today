export const checkForUpdates = async (): Promise<boolean> => {
  try {
    const lastCheck = await AsyncStorage.getItem(IMPORT_LAST_CHECK_KEY);
    const now = new Date().getTime();
    
    if (!lastCheck || now - parseInt(lastCheck) > UPDATE_CHECK_INTERVAL) {
      await AsyncStorage.setItem(IMPORT_LAST_CHECK_KEY, now.toString());
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const importData = async (): Promise<boolean> => {
  try {
    const response = await fetch(IMPORT_URL);
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    if (!data || !data.success) {
      return false;
    }
    
    await AsyncStorage.setItem(IMPORT_DATA_KEY, JSON.stringify(data.data));
    return true;
  } catch (error) {
    return false;
  }
}; 