import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen2 from '../screens/home/HomeScreen2';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyRequestScreen from '../screens/request/MyRequestScreen';
import MedicalRecordsScreen from '../screens/records/MedicalRecordsScreen';
import { View, Text } from 'react-native';

// Placeholder screens for tabs not yet implemented
const RecordsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Records Screen</Text></View>;

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    borderTopColor: theme.colors.secondary,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'help-outline';
                    if (route.name === 'HomeTab') iconName = 'home';
                    else if (route.name === 'Records') iconName = 'description';
                    else if (route.name === 'Requests') iconName = 'list';
                    else if (route.name === 'ProfileTab') iconName = 'person';

                    return <Icon name={iconName} size={size} color={color} />;
                }
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen2} options={{ title: 'Home' }} />
            <Tab.Screen name="Records" component={MedicalRecordsScreen} />
            <Tab.Screen name="Requests" component={MyRequestScreen} />
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
