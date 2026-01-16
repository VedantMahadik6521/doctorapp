import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const bootstrap = async () => {
      const user = auth().currentUser;
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');

      setTimeout(() => {
        if (user) {
          navigation.replace('EntryGate');
        } else if (!hasSeenWelcome) {
          navigation.replace('Welcome');
        } else {
          navigation.replace('Login');
        }
      }, 1500);
    };

    bootstrap();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../assets/images/splash_logo.png')}
        style={styles.logo}
      />

      {/* App Name */}
      <Text style={styles.appName}>Doctor4Home</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>Healthcare Redefined</Text>
    </View>
  );
};

export default SplashScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  tagline: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
