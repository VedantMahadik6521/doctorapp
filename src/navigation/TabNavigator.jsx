import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import HomeScreen2 from '../screens/home/HomeScreen2';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyRequestScreen from '../screens/request/MyRequestScreen';
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
                    // Using simple text/emojis since vector icons aren't installed yet
                    // In a real app with assets, we'd use Image or Vector Icons here
                    let icon = '❓';
                    if (route.name === 'HomeTab') icon = '🏠';
                    else if (route.name === 'Records') icon = '📄';
                    else if (route.name === 'Requests') icon = '📞';
                    else if (route.name === 'ProfileTab') icon = '👤';

                    return <Text style={{ fontSize: 20 }}>{icon}</Text>;
                }
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen2} options={{ title: 'Home' }} />
            <Tab.Screen name="Records" component={RecordsScreen} />
            <Tab.Screen name="Requests" component={MyRequestScreen} />
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
