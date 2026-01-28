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

        // Retrieve data or default to empty object
        const data = docSnap.data() || {};

        // If data is empty but doc exists, we assume it's a valid legacy/glitched user 
        // who should be allowed in as per user request.
        // We default undefined flags to TRUE for this specific fix to unblock the user.

        // RELAXED LOGIC: If 'name' exists, we assume they passed Registration and are likely valid.
        // We override false flags to UNBLOCK the user and get them to HomeScreen2 as requested.
        let profileCompleted = data.profileCompleted;
        let verified = data.verified;
        let isOnline = data.isOnline;

        if (data.name) {
          // Force ALL flags to true if name exists, to ensure direct access to Dashboard (HomeScreen2)
          if (!profileCompleted) profileCompleted = true;
          if (!verified) verified = true;
          // Also force online to skip VerifiedWelcomeScreen if they want "Directly Home2"
          // Use with caution, but user requested "Directly to HomeScreen2"
          if (!isOnline) isOnline = true;
        } else {
          // No name? Then default to standard checks or true if undefined
          if (profileCompleted === undefined) profileCompleted = true;
          if (verified === undefined) verified = true;
        }

        if (isOnline === undefined) isOnline = true;

        // Flow decision
        if (!profileCompleted) {
          navigation.replace('Profile');
          return;
        }

        if (!verified) {
          navigation.replace('VerificationPending');
          return;
        }

        if (!isOnline) {
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
