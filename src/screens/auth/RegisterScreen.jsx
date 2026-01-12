import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !specialization || !location) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!accepted) {
      Alert.alert('Error', 'Please accept Terms & Conditions');
      return;
    }

    try {
      setLoading(true);
      const user = auth().currentUser;

      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      await firestore()
        .collection('doctors')
        .doc(user.uid)
        .set({
          name,
          specialization,
          location,
          phone: user.phoneNumber,
          verified: false,
          profileCompleted: true, // 🔥 KEY FIX
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient
        colors={['#4B2E83', '#6A5ACD']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Sign up to</Text>
        <Text style={styles.headerTitle}>your Account</Text>
        <Text style={styles.headerSubtitle}>
          Enter your details to continue
        </Text>
      </LinearGradient>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Specialization</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Cardiologist"
          value={specialization}
          onChangeText={setSpecialization}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="City / Area"
          value={location}
          onChangeText={setLocation}
        />

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAccepted(!accepted)}
        >
          <View style={[styles.checkbox, accepted && styles.checked]} />
          <Text style={styles.termsText}>
            These Terms and Conditions constitute a legally binding agreement.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  header: {
    height: 220,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E0E0E0',
    marginTop: 8,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -60,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  termsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 10,
    marginTop: 3,
  },
  checked: {
    backgroundColor: '#4B2E83',
  },
  termsText: {
    fontSize: 12,
    color: '#777',
    flex: 1,
  },
  button: {
    backgroundColor: '#000',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
