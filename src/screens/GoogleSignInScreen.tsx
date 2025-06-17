import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useTheme } from '../hooks/useTheme';
import { userDataService } from '../services/userDataService';
import { networkSecurity } from '../services/networkSecurity';
import { LoadingAnimation } from '../components/LoadingAnimation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'GoogleSignIn'>;

const GoogleSignInScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleSignIn(response.authentication?.accessToken);
    }
  }, [response]);

  const handleSignIn = async (token?: string) => {
    if (!token) {
      setError('Failed to get authentication token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await userInfoResponse.json();

      // Store user data securely
      await userDataService.setUserData({
        id: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.name,
        preferences: {
          notifications: true,
          theme: 'system',
        },
      });

      // Store session token
      await userDataService.setSessionToken(token);

      // Register user with our backend
      await networkSecurity.post('/auth/register', {
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
      });

      navigation.replace('Main');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <LinearGradient
          colors={[colors.primary + '99', colors.secondary + '66', '#ffffff33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to Halacha Today
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to access your personalized halacha experience
          </Text>

          {error && (
            <Text style={[styles.error, { color: colors.error }]}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: colors.card }]}
            onPress={() => promptAsync()}
            disabled={isLoading || !request}
          >
            <Image
              source={require('../assets/google-logo.png')}
              style={styles.googleLogo}
            />
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Sign in with Google
            </Text>
          </TouchableOpacity>

          <Text style={[styles.terms, { color: colors.textSecondary }]}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </BlurView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingAnimation />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GoogleSignInScreen; 