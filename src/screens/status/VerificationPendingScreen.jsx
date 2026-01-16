import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VerificationPendingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification Pending</Text>
      <Text style={styles.message}>
        Your profile has been submitted and is currently under review.
        Please check back later.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default VerificationPendingScreen;
