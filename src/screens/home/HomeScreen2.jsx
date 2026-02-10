import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  Alert,
  PermissionsAndroid,
  Switch
} from 'react-native';
import GetLocation from 'react-native-get-location';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth'; // Import auth
import firestore from '@react-native-firebase/firestore'; // Import firestore


// ...

// Mock Data for Testimonials
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Dr. Rohan Mishra',
    role: 'Surgeon',
    text: 'I love the flexibility. I can accept requests anytime based on my availability. Fantastic platform for home consultations!',
    rating: 5,
    joined: 'joined 1 year ago',
  },
  {
    id: 2,
    name: 'Dr. Sarah Smith',
    role: 'Pediatrician',
    text: 'Great way to connect with patients in need. The interface is very intuitive and easy to use.',
    rating: 5,
    joined: 'joined 6 months ago',
  },
  {
    id: 3,
    name: 'Dr. Emily Chen',
    role: 'Dermatologist',
    text: 'Helping patients at their homes has never been easier. Highly recommended for doctors looking to expand their reach.',
    rating: 4,
    joined: 'joined 2 years ago',
  },
];

const { width } = Dimensions.get('window');

const HomeScreen2 = () => {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [location, setLocation] = useState('India');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isOnline, setIsOnline] = useState(false); // State for online status
  const [doctorName, setDoctorName] = useState('Vedant'); // State to store doctor name potentially

  // Fetch initial status and listen for updates
  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      const unsubscribe = firestore()
        .collection('doctors')
        .doc(user.uid)
        .onSnapshot(documentSnapshot => {
          if (documentSnapshot && documentSnapshot.exists) {
            const data = documentSnapshot.data();
            setIsOnline(data.online2 || false); // Get online2 status, default to false
            if (data.name) setDoctorName(data.name);
          }
        }, error => {
          console.error("Error fetching doctor data: ", error);
        });

      return () => unsubscribe();
    }
  }, []);

  const toggleOnlineStatus = async () => {
    const user = auth().currentUser;
    if (user) {
      try {
        const newStatus = !isOnline;
        // Optimistic update
        setIsOnline(newStatus);
        await firestore().collection('doctors').doc(user.uid).update({
          online2: newStatus
        });
        console.log(`Updated online2 status to: ${newStatus}`);
      } catch (error) {
        console.error("Error updating online status: ", error);
        Alert.alert("Error", "Could not update status. Please try again.");
        setIsOnline(!isOnline); // Revert on failure
      }
    } else {
      Alert.alert("Error", "You are not logged in.");
    }
  };


  // Reusing Location Logic from HomeScreen
  // Reusing Location Logic from HomeScreen
  // Reusing Location Logic from HomeScreen
  const requestLocation = async () => {
    try {
      // 1. Check Permissions Safely
      let hasPermission = false;
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);

          const fineGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
          const coarseGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

          hasPermission = fineGranted || coarseGranted;
        } catch (permError) {
          console.log('Permission check failed:', permError);
        }
      } else {
        hasPermission = true; // Assume iOS handles it via Info.plist for now or add Geolocation.requestAuthorization()
      }

      if (!hasPermission) {
        // Just log and return, don't crash or alert aggressively on load
        console.log('Location permission denied or failed.');
        return;
      }

      // 2. Get Location via GetLocation
      console.log('Requesting location via GetLocation...');

      try {
        const locationData = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 60000,
        });

        console.log('Location fetched:', locationData);
        const { latitude, longitude } = locationData;

        try {
          const API_KEY = 'AIzaSyBc9YbbzICoaIYZDF0EcPT4MnDkKZAzvnk';
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
          );
          const json = await response.json();

          if (json.results && json.results.length > 0) {
            let city = '';
            let state = '';

            json.results[0].address_components.forEach(component => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
            });

            if (!city) {
              const subAdmin = json.results[0].address_components.find(c => c.types.includes('administrative_area_level_2'));
              if (subAdmin) city = subAdmin.long_name;
            }

            if (city && state) {
              setLocation(`${city}, ${state}`);
            } else if (city) {
              setLocation(city);
            } else {
              setLocation(json.results[0].formatted_address.split(',')[0]);
            }
          } else {
            console.log('No geocoding results found.');
          }
        } catch (geoError) {
          console.log('Geocoding error:', geoError);
          Alert.alert('Geocoding Error', geoError.message);
        }
      } catch (error) {
        const { code, message } = error;
        console.warn(code, message);
        Alert.alert('Location Error', message);
      }
    } catch (err) {
      console.log('Unexpected error in requestLocation:', err);
    }
  };

  useEffect(() => {
    requestLocation();
    // console.log('Location request skipped for debugging');
  }, []);

  const renderStars = (rating) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {[...Array(5)].map((_, i) => (
          <Text key={i} style={{ color: i < rating ? '#FFD700' : '#ccc' }}>
            {i < rating ? '★' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* 🔹 HEADER */}
      <LinearGradient
        colors={['#4B2E83', '#2E1A47']} // Always Purple
        style={styles.header}
      >
        <View style={styles.headerTop}>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={{ marginRight: 15, padding: 5 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View>
              <Text style={{ color: '#E0E0E0', fontSize: 10 }}>Location</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>{location}</Text>
                <Icon name="keyboard-arrow-down" size={12} color="#FFFFFF" style={{ marginLeft: 5 }} />
              </View>
            </View>
          </View>

          {/* Right: Theme Toggle & Notification */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
              <Icon name={theme.isDarkMode ? 'wb-sunny' : 'nightlight-round'} size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
              <View>
                <Icon name="notifications" size={22} color="#FFFFFF" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

        </View>

        {/* Header Content */}
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Manage Your Patients Efficiently</Text>

          {/* Welcome Text + Toggle Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerSubtitle, { color: '#E0E0E0', marginBottom: 5 }]}>
                Welcome, {doctorName}
              </Text>
              <Text style={{ color: '#E0E0E0', fontSize: 12 }}>
                you can change your status <Text style={{ color: isOnline ? '#32CC32' : '#FF4500', fontWeight: 'bold' }}>{isOnline ? 'online' : 'offline'}</Text>
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Switch
                trackColor={{ false: "#767577", true: "#00BFFF" }}
                thumbColor={isOnline ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleOnlineStatus}
                value={isOnline}
                style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }} // Make it slightly bigger
              />
            </View>
          </View>
        </View>

      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

        {/* 🔹 ANALYTICS OVERVIEW CARD */}
        <TouchableOpacity
          style={[styles.analyticsCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
          onPress={() => navigation.navigate('AnalyticsScreen')} // To be added to stack
        >
          <View style={styles.analyticsIconCircle}>
            <Icon name="analytics" size={24} color="#6A0DAD" />
          </View>
          <Text style={[styles.analyticsText, { color: theme.colors.text }]}>Analytics Overview</Text>
        </TouchableOpacity>


        {/* 🔹 TESTIMONIALS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What our Doctors say</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllTestimonialsScreen')}>
            <Text style={{ color: theme.colors.primary }}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const slide = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
            if (slide !== activeSlide) setActiveSlide(slide);
          }}
          style={styles.carousel}
        >
          {TESTIMONIALS.map((item, index) => (
            <View key={item.id} style={[styles.testimonialCard, { width: width - 40, backgroundColor: '#A992E2' }]}>
              <Text style={{ position: 'absolute', right: 10, top: 10, fontSize: 10, color: '#fff' }}>{item.joined}</Text>
              <Text style={styles.testimonialName}>{item.name}</Text>
              <Text style={{ color: '#E0E0E0', fontSize: 14, marginBottom: 8, fontStyle: 'italic' }}>{item.role}</Text>
              <Text style={styles.testimonialText}>"{item.text}"</Text>
              <View style={{ marginTop: 10 }}>
                {renderStars(item.rating)}
              </View>
            </View>
          ))}
        </ScrollView>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {TESTIMONIALS.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === activeSlide ? theme.colors.primary : '#ccc' }]} />
          ))}
        </View>


        {/* 🔹 HOW IT WORKS SECTION */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 20, marginTop: 20 }]}>How Doctor4Home works</Text>

        <View style={styles.howItWorksContainer}>
          {/* Row 1 */}
          <View style={styles.howRow}>
            <View style={[styles.howCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.iconBox, { backgroundColor: '#D8BFD8' }]}>
                <Icon name="search" size={20} color="#6A0DAD" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>Complete</Text>
                <Text style={{ color: theme.colors.text }}>Your Profile</Text>
              </View>
            </View>
            <View style={[styles.howCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.iconBox, { backgroundColor: '#D8BFD8' }]}>
                <Icon name="check" size={20} color="#6A0DAD" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>Go Online</Text>
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.howRow}>
            <View style={[styles.howCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.iconBox, { backgroundColor: '#D8BFD8' }]}>
                <Icon name="home" size={20} color="#6A0DAD" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>Accept</Text>
                <Text style={{ color: theme.colors.text }}>Requests</Text>
              </View>
            </View>
            <View style={[styles.howCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.iconBox, { backgroundColor: '#D8BFD8' }]}>
                <Icon name="description" size={20} color="#6A0DAD" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>Visit & Update</Text>
                <Text style={{ color: theme.colors.text }}>Records</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 50,
    paddingTop: Platform.OS === 'android' ? 50 : 20, // Add top padding for status bar
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20, // Add space below subtitle
  },
  analyticsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    marginTop: 10, // Separated from header
  },
  analyticsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6E6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  analyticsText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  carousel: {
    paddingLeft: 20,
  },
  testimonialCard: {
    padding: 20,
    borderRadius: 15,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 150
  },
  testimonialName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  testimonialText: {
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3
  },
  howItWorksContainer: {
    padding: 20
  },
  howRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  howCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default HomeScreen2;