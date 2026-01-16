import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../../assets/images/welcome1.png'),
    title: 'Your Doctor,\nAt Your Home.',
    subtitle: 'Medical care delivered with comfort and trust.',
  },
  {
    id: '2',
    image: require('../../assets/images/welcome2.png'),
    title: "Don’t Travel,\nJust Heal.",
    subtitle:
      'Avoid hectic medical visits. Get professional medical care at home.',
  },
  {
    id: '3',
    image: require('../../assets/images/welcome3.png'),
    title: 'Trusted Care,\nVerified.',
    subtitle:
      'All medical professionals are platform verified & approved.',
  },
];

const WelcomeScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const finishWelcome = async () => {
    // 🔐 Mark welcome as seen (VERY IMPORTANT)
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.replace('Login');
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await finishWelcome();
    }
  };

  return (
    <LinearGradient
      colors={['#14B56C', '#4B2E83']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={finishWelcome}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slider */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1
            ? 'Get Started'
            : 'Next'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default WelcomeScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skip: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 120,
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#E0E0E0',
    fontSize: 14,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#aaa',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 18,
  },
  button: {
    backgroundColor: '#1DB954',
    marginHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
