import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsAndPrivacyScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    // Privacy States
    const [pushNotifications, setPushNotifications] = useState(true);

    const toggleSwitch = (setter, value) => {
        setter(!value);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => console.log("Delete Account logic") }
            ]
        );
    };


    const SettingCard = ({ icon, title, subtitle, isSwitch, value, onToggle, hasArrow, isDestructive, dangerText, onPress }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card }]}
            onPress={isSwitch ? null : (isDestructive ? handleDeleteAccount : onPress)}
            activeOpacity={isSwitch ? 1 : 0.7}
        >
            <View style={styles.cardContent}>
                {icon && (
                    <View style={[styles.iconContainer, isDestructive && styles.destructiveIconContainer]}>
                        {icon}
                    </View>
                )}
                {/* For items without icon (top section), title is the main focus */}
                <View style={styles.textContainer}>
                    <Text style={[
                        styles.settingTitle,
                        { color: isDestructive ? '#FF6347' : theme.colors.text },
                        !icon && { fontSize: 16, fontWeight: '600' }
                    ]}>
                        {title}
                    </Text>
                    {subtitle && <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
                </View>

                {isSwitch && (
                    <Switch
                        trackColor={{ false: "#E0E0E0", true: "#A78BFA" }} // Light purple track
                        thumbColor={value ? "#7C3AED" : "#f4f3f4"} // Darker purple thumb
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => onToggle(value)}
                        value={value}
                    />
                )}

                {hasArrow && (
                    <Icon name="chevron-right" size={20} color="#C4C4C4" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backButton}>
                    <Icon name="arrow-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Setting and Privacy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Privacy Toggles */}
                <SettingCard
                    title="Push Notifications"
                    subtitle="Receive appointment reminders"
                    isSwitch
                    value={pushNotifications}
                    onToggle={() => toggleSwitch(setPushNotifications, pushNotifications)}
                />


                {/* General Settings */}
                <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>General Settings</Text>

                <SettingCard
                    icon={<Icon name="person" size={20} color="#7C3AED" />} // Purple Icon
                    title="Account Information"
                    hasArrow
                    onPress={() => navigation.navigate('AccountInfo')}
                />

                <SettingCard
                    icon={<Icon name="description" size={20} color="#7C3AED" />}
                    title="Terms and condition"
                    hasArrow
                    onPress={() => navigation.navigate('TermsCondition')}
                />
                <SettingCard
                    icon={<Icon name="privacy-tip" size={20} color="#7C3AED" />}
                    title="Privacy Policy"
                    hasArrow
                    onPress={() => navigation.navigate('PrivacyPolicy')}
                />

                {/* Delete Account - Spaced out */}
                <View style={{ marginTop: 20 }}>
                    <SettingCard
                        icon={<Icon name="delete" size={20} color="#FF6347" />} // Red for delete
                        title="Delete account"
                        isDestructive
                    // No arrow in mockup for delete? Actually mockup shows "Delete account" text in red, icon is GPay? weird placeholder. 
                    // I will keep my cleaner design but follow the text color.
                    />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 60 : 20, // Increased top padding
        paddingBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10, // Adjust centering if needed
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'flex-start', // Left align title as per Android guidelines usually, or center? Mockup is leftish.
        marginLeft: 10,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 0,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 25,
        marginBottom: 15,
        marginLeft: 5,
    },
    card: {
        borderRadius: 15,
        marginBottom: 15,
        padding: 15,
        // Shadow for "Card" look
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3E8FF', // Light purple background
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    destructiveIconContainer: {
        backgroundColor: '#FFEBEE',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 12,
        marginTop: 4,
        opacity: 0.7,
    },
    iconButton: {
        marginLeft: 15,
    }
});

export default SettingsAndPrivacyScreen;
