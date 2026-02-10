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

        // No Firestore profile yet OR valid profile data missing (e.g. name)
        // This ensures "ghost" users with empty docs still go to Register
        if (!docSnap.exists || !docSnap.data()?.name) {
          navigation.replace('Register');
          return;
        }

        // Retrieve data or default to empty object
        const data = docSnap.data() || {};

        let profileCompleted = data.profileCompleted;
        let verified = data.verified;
        let isOnline = data.isOnline;

        // Default undefined flags to false for safety, or handle legacy data if needed.
        // If they are undefined, it usually means the profile isn't fully set up.
        if (profileCompleted === undefined) profileCompleted = false;
        if (verified === undefined) verified = false;
        if (isOnline === undefined) isOnline = false;



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
