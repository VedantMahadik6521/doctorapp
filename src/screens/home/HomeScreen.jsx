import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [doctorName, setDoctorName] = useState('');
  const [location, setLocation] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  /* 🔹 REQUEST LOCATION */
  const requestLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Location permission is needed');
          return;
        }
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const loc = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocation(loc);
        },
        error => {
          console.log(error);
          Alert.alert('Error', 'Unable to fetch location');
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* 🔹 FETCH DOCTOR + LOCATION POPUP */
  useEffect(() => {
    let isMounted = true;

    const fetchDoctor = async () => {
      try {
        const user = auth().currentUser;
        if (!user) return;

        const docSnap = await firestore()
          .collection('doctors')
          .doc(user.uid)
          .get();

        if (docSnap.exists && isMounted) {
          const data = docSnap.data() || {};
          setDoctorName(data.name ?? '');
        }
      } catch (error) {
        console.log('Error fetching doctor:', error);
      }
    };

    fetchDoctor();
    requestLocation(); // 👈 popup on first entry

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#F5F5F5',
      }}
    >
      {/* 🔹 HEADER */}
      <LinearGradient
        colors={
          isDarkMode
            ? ['#4B2E83', '#2E1A47']
            : ['#E0E0E0', '#FFFFFF']
        }
        style={styles.header}
      >
        <View style={styles.topRow}>
          <View style={styles.locationBox}>
            <Text
              style={[
                styles.locationLabel,
                { color: isDarkMode ? '#ccc' : '#666' },
              ]}
            >
              Location
            </Text>
            <Text
              style={[
                styles.locationText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {location || 'Fetching...'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setIsDarkMode(prev => !prev)}
              style={{ marginRight: 15 }}
            >
              <Text style={{ fontSize: 20 }}>
                {isDarkMode ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.bell, { color: isDarkMode ? '#fff' : '#000' }]}>
              🔔
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.welcome,
            { color: isDarkMode ? '#ccc' : '#555' },
          ]}
        >
          Welcome,
        </Text>

        <Text
          style={[
            styles.name,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {doctorName ? `Dr. ${doctorName}` : 'Doctor'}
        </Text>
      </LinearGradient>

      {/* 🔹 CARD */}
      <View
        style={[
          styles.card,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' },
        ]}
      >
        <Image
          source={require('../../assets/images/map.png')}
          style={styles.mapImage}
        />
        <Text
          style={{
            marginTop: 10,
            textAlign: 'center',
            color: isDarkMode ? '#ddd' : '#333',
          }}
        >
          Patients are searching for doctors near you.
        </Text>
      </View>

      {/* 🔹 STEPS */}
      <View style={styles.steps}>
        {[
          'Complete your Profile',
          'Go Online',
          'Accept Requests',
          'Visit & Update Records',
        ].map((item, index) => (
          <View key={index} style={styles.stepItem}>
            <Text
              style={{
                fontSize: 16,
                color: isDarkMode ? '#ddd' : '#333',
              }}
            >
              {item}
            </Text>
            <Text
              style={{
                fontWeight: 'bold',
                color: isDarkMode ? '#aaa' : '#555',
              }}
            >
              {index + 1}
            </Text>
          </View>
        ))}
      </View>

      {/* 🔹 BUTTON */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDarkMode ? '#4B2E83' : '#6A5ACD' },
        ]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Create Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

/* 🔹 STYLES */
const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 30,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bell: {
    fontSize: 20,
  },
  locationBox: {
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  welcome: {
    marginTop: 20,
    fontSize: 18,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  card: {
    margin: 20,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  mapImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  steps: {
    paddingHorizontal: 20,
  },
  stepItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  button: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
