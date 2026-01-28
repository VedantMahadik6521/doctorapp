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
  PermissionsAndroid
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

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

  // Reusing Location Logic from HomeScreen
  const requestLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          // Alert.alert('Permission Required', 'Location permission is needed');
          return;
        }
      }

      // Mocking location fetch if geolocation isn't available or simple logic
      // In real app use navigator.geolocation
      setLocation('Mumbai, India');
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    requestLocation();
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
          <Text style={[styles.headerSubtitle, { color: '#E0E0E0' }]}>
            Welcome, Vedant please turn your status <Text style={{ color: '#00BFFF' }}>online </Text>
          </Text>
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
              <Text style={styles.testimonialText}>"{item.text}"</Text>
              <Text style={{ alignSelf: 'flex-end', color: '#fff', marginTop: 5 }}>- {item.role}</Text>
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