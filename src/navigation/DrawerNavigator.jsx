import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from '../context/ThemeContext';
import TabNavigator from './TabNavigator';
import MyRequestScreen from '../screens/request/MyRequestScreen';
import { View, Text } from 'react-native';

const Drawer = createDrawerNavigator();

// Placeholder screens for Drawer items
// Note: Profile is also in Tabs, but requested in Drawer too.
const HelpScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Help & Support</Text></View>;
const SettingsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Settings & Privacy</Text></View>;
const LogoutScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Logout Processing...</Text></View>;

const DrawerNavigator = () => {
    const { theme } = useTheme();

    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false, // We will use custom header in HomeScreen2
                drawerStyle: {
                    backgroundColor: theme.colors.background,
                },
                drawerActiveTintColor: theme.colors.primary,
                drawerInactiveTintColor: theme.colors.text,
            }}
        >
            <Drawer.Screen name="Dashboard" component={TabNavigator} options={{ title: 'Home' }} />
            <Drawer.Screen name="Requests" component={MyRequestScreen} />
            {/* Profile is accessible via Tabs, but we can add deep link or duplicate here if desired. 
          For now, keeping strictly requested items. */}
            {/* "Requests" was requested.
          "Profile" was requested.
          "Help and support".
          "setting and privacy".
          "Logout". 
      */}
            {/* We can map "Profile" in drawer to the Profile Tab if needed, or a separate screen.
          Since ProfileScreen exists, we can link it. But Drawer typically expects a component.
          To keep navigation clean, I'll point it to a stack wrapper or just the component.
      */}
            <Drawer.Screen name="DrawerProfile" component={TabNavigator} listeners={({ navigation }) => ({
                drawerItemPress: (e) => {
                    e.preventDefault();
                    // Navigate to the Dashboard (TabNavigator) and then to ProfileTab
                    navigation.navigate('Dashboard', { screen: 'ProfileTab' });
                    navigation.closeDrawer();
                },
            })} options={{ title: 'Profile' }} />

            <Drawer.Screen name="Help" component={HelpScreen} options={{ title: 'Help & Support' }} />
            <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings & Privacy' }} />
            <Drawer.Screen name="Logout" component={LogoutScreen} />
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
