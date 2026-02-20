import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import firestore from '@react-native-firebase/firestore';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';

const App = () => {
  const [maintenance, setMaintenance] = useState({ active: false, msg: '', loading: true });

  useEffect(() => {
    // Listen for maintenance updates from the Admin app
    const unsub = firestore()
      .collection('app_controls')
      .doc('maintenance')
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          setMaintenance({
            active: data.underMaintenance || false,
            msg: data.message || 'The system is currently under maintenance. Please try again later.',
            loading: false,
          });
        } else {
          setMaintenance(prev => ({ ...prev, loading: false }));
        }
      }, error => {
        console.error("Maintenance check failed", error);
        setMaintenance(prev => ({ ...prev, loading: false }));
      });
    return () => unsub();
  }, []);

  if (maintenance.loading) {
    return null; // Or a splash screen
  }

  // If maintenance is active, show the block screen
  if (maintenance.active) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>System Maintenance</Text>
          <Text style={styles.message}>{maintenance.msg}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
  card: { padding: 30, backgroundColor: '#fff', borderRadius: 20, elevation: 5, alignItems: 'center', margin: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#6C47FF', marginBottom: 15 },
  message: { textAlign: 'center', fontSize: 16, color: '#444', lineHeight: 22 }
});

export default App;
