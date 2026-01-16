import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AppEntryGate = ({ navigation }) => {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      try {
        // 🔴 USER DELETED OR LOGGED OUT
        if (!user) {
          navigation.replace('Login');
          return;
        }

        const docRef = firestore()
          .collection('doctors')
          .doc(user.uid);

        const docSnap = await docRef.get();

        // No Firestore profile yet
        if (!docSnap.exists) {
          navigation.replace('Register');
          return;
        }

        const data = docSnap.data();
        if (!data) {
          navigation.replace('Register');
          return;
        }

        // Flow decision
        if (!data.profileCompleted) {
          navigation.replace('Profile');
          return;
        }

        if (!data.verified) {
          navigation.replace('VerificationPending');
          return;
        }

        if (!data.isOnline) {
          navigation.replace('VerifiedWelcome', {
            doctorName: data.name || 'Doctor',
            location: data.location || 'Ravet',
          });
          return;
        }

        // ✅ Verified + Online
        navigation.replace('Dashboard');
      } catch (error) {
        console.error('EntryGate Error:', error);
        navigation.replace('Login');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AppEntryGate;
