import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Keyboard
} from 'react-native';
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';

const OtpScreen = ({ route, navigation }) => {
  const { confirm, phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Ref for the hidden text input
  const inputRef = useRef(null);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await confirm.confirm(otp);
      // 🔥 SESSION CONTROLLED BY ENTRY GATE
      navigation.replace('EntryGate');
    } catch (error) {
      Alert.alert('Invalid OTP', 'Please try again');
    }
    setLoading(false);
  };

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4B2E83" />

      {/* Header Gradient */}
      <LinearGradient
        colors={['#4B2E83', '#2E1A47']}
        style={styles.header}
      >
        <Text style={styles.title}>OTP{'\n'}Verification</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your Email/{'\n'}Phone no.</Text>
      </LinearGradient>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        <View style={styles.card}>
          <Text style={styles.cardInfoText}>
            Enter the OTP sent to your{'\n'}mobile number.
          </Text>

          {/* Custom OTP Input Container */}
          <View style={styles.otpContainer}>
            {/* The Hidden Actual Input */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              returnKeyType="done"
            />

            {/* Visual Boxes */}
            <View style={styles.boxesRow}>
              {[...Array(6)].map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.box,
                    otp.length === index && styles.activeBox // Highlight current box
                  ]}
                  onPress={() => inputRef.current?.focus()}
                  activeOpacity={1}
                >
                  <Text style={styles.boxText}>
                    {otp[index] || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ marginTop: 30 }}>
          <Text style={styles.resendText}>
            Don't Receive an OTP? <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 20
  },
  bottomContainer: {
    flex: 1,
    marginTop: -50,
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 200,
    alignItems: 'center'
  },
  cardInfoText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 14,
    lineHeight: 20
  },
  otpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    height: 60, // define height to contain hidden input
    justifyContent: 'center'
  },
  hiddenInput: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0, // Hide it but keep it tappable/focusable
    zIndex: 1
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  box: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  activeBox: {
    borderColor: '#4B2E83', // Purple highlight
    borderWidth: 2
  },
  boxText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  button: {
    backgroundColor: '#000000',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendText: {
    color: '#888',
    fontSize: 14
  },
  resendLink: {
    color: '#5D9C59', // Greenish or use Blue
    fontWeight: 'bold'
  }
});
