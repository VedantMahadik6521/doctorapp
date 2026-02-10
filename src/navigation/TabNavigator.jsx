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
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'help-outline';
                    if (route.name === 'HomeTab') iconName = 'home';
                    else if (route.name === 'Records') iconName = 'description';
                    else if (route.name === 'Requests') iconName = 'account-balance-wallet';
                    else if (route.name === 'ProfileTab') iconName = 'person';

                    return (
                        <View style={{
                            backgroundColor: focused ? 'black' : 'transparent',
                            borderRadius: 25,
                            height: 50,
                            width: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Icon name={iconName} size={24} color={focused ? 'white' : color} />
                        </View>
                    );
                }
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen2} options={{ title: 'Home' }} />
            <Tab.Screen name="Requests" component={MyRequestScreen} />
            <Tab.Screen name="Records" component={MedicalRecordsScreen} />
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
