import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PrivacyPolicyScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Information Collection</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    We collect information that you identify yourself with, such as your name, email address, and phone number, as well as data related to your professional practice and patients.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Use of Information</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    The information we collect is used to provide and specific services to you, to improve our app, and to communicate with you regarding updates and support.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. Data Security</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    We implement a variety of security measures to maintain the safety of your personal information. Your data is encrypted and stored on secure servers.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. Sharing of Information</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our app.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>5. Your Rights</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    You have the right to access, correct, or delete your personal information maintained by us. Please contact support for any such requests.
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 10,
        textAlign: 'justify'
    },
});

export default PrivacyPolicyScreen;
