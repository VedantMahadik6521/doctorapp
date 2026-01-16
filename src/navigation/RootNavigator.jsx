import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/* Screens */
import SplashScreen from '../screens/splash/SplashScreen';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import VerificationPendingScreen from '../screens/status/VerificationPendingScreen';
import VerifiedWelcomeScreen from '../screens/status/VerifiedWelcomeScreen';
import HomeScreen from '../screens/home/HomeScreen';
import HomeScreen2 from '../screens/home/HomeScreen2';
import AnalyticsScreen from '../screens/home/AnalyticsScreen';
import AllTestimonialsScreen from '../screens/home/AllTestimonialsScreen';
import NotificationScreen from '../screens/home/NotificationScreen';

/* Entry Gate */
import AppEntryGate from './AppEntryGate';

const Stack = createNativeStackNavigator();

/* Main App Structure */
import DrawerNavigator from './DrawerNavigator';

const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Splash"
    >
      {/* Splash → Welcome / EntryGate */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      {/* 🔑 SESSION DECIDER (MOST IMPORTANT) */}
      <Stack.Screen name="EntryGate" component={AppEntryGate} />

      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />

      {/* Registration / Profile */}
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* Status-based Screens */}
      <Stack.Screen
        name="VerificationPending"
        component={VerificationPendingScreen}
      />
      <Stack.Screen
        name="VerifiedWelcome"
        component={VerifiedWelcomeScreen}
      />

      {/* Main Dashboard (Drawer + Tabs + Home2) */}
      <Stack.Screen name="Dashboard" component={DrawerNavigator} />
      {/* Keeping legacy Home temporarily if needed, but Dashboard is primary now */}
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* <Stack.Screen name="Home2" component={HomeScreen2} /> Removed to force Dashboard usage */}
      <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
      <Stack.Screen name="AllTestimonialsScreen" component={AllTestimonialsScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
