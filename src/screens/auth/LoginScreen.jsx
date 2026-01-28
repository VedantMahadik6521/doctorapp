import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  SafeAreaView
} from 'react-native';
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      Alert.alert('Error', 'Enter valid 10-digit number');
      return;
    }

    setLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
      navigation.navigate('Otp', {
        confirm: confirmation,
        phone,
      });
    } catch (error) {
      Alert.alert('OTP Error', error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4B2E83" />

      {/* Top Gradient Half */}
      <LinearGradient
        colors={['#4B2E83', '#2E1A47']}
        style={styles.header}
      >
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.subtitleText}>Enter your Mobile number to{'\n'}receive an OTP.</Text>
      </LinearGradient>

      {/* Bottom White Half with Overlapping Card */}
      <View style={styles.bottomContainer}>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Mobile number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Get OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service &{'\n'}Privacy Policy
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5' // Light grey background for bottom part
  },
  header: {
    height: '45%', // Takes up roughly top half
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50 // Push text up a bit
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10
  },
  subtitleText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24
  },
  bottomContainer: {
    flex: 1,
    marginTop: -50, // This creates the overlap effect
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    borderRadius: 20,
    padding: 24,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 200
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 24
  },
  button: {
    backgroundColor: '#000000', // Black button as requested
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  footerText: {
    marginTop: 40,
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18
  }
});
