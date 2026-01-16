import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const VerifiedWelcomeScreen = ({ navigation, route }) => {
  const { doctorName = 'Doctor', location = 'Ravet' } = route.params || {};

  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoOnline = async value => {
    if (loading) return;

    try {
      setLoading(true);
      setIsOnline(value);

      const user = auth().currentUser;
      if (!user) throw new Error('User not logged in');

      await firestore()
        .collection('doctors')
        .doc(user.uid)
        .update({
          isOnline: true,
        });

      // 🔥 SESSION CONTROLLED BY ENTRY GATE
      navigation.replace('EntryGate');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to go online');
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Location Header */}
      <View style={styles.header}>
        <Text style={styles.location}>📍 {location}</Text>
        
      </View>

      {/* Greeting */}
      <Text style={styles.hello}>Hello {doctorName} !</Text>

      {/* Info Message */}
      <View style={styles.messageBox}>
        <Text style={styles.message}>
          Welcome, {doctorName}. Please turn your status to online 
        </Text>
      </View>

      {/* Go Online Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Go Online</Text>
        <Switch
          value={isOnline}
          onValueChange={handleGoOnline}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
};

export default VerifiedWelcomeScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
  },
  address: {
    fontSize: 12,
    color: '#777',
  },
  hello: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  messageBox: {
    marginTop: 50,
  },
  message: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  toggleRow: {
    marginTop: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
