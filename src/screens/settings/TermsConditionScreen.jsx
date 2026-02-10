import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TermsConditionScreen = () => {
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
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Terms and Conditions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Introduction</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Welcome to DoctorApp. By using our application, you agree to comply with and be bound by the following terms and conditions of use. Please review these terms carefully.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Acceptance of Agreement</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    You agree to the terms and conditions outlined in this Agreement with respect to our application. This Agreement constitutes the entire and only agreement between us and you, and supersedes all prior or contemporaneous agreements.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. Use of Services</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    Our services are provided for healthcare management purposes. You agree not to use the app for any unlawful purpose or in any way that interrupts, damages, or impairs the service.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. Limitations of Liability</Text>
                <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                    We shall not be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use our application.
                </Text>

                {/* Pre-ticked Checkbox */}
                <View style={styles.checkboxContainer}>
                    <View style={[styles.checkbox, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
                        <Icon name="check" size={16} color="white" />
                    </View>
                    <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
                        I have read and agree to the Terms and Conditions
                    </Text>
                </View>

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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        padding: 15,
        backgroundColor: 'rgba(124, 58, 237, 0.05)', // Light purple tint
        borderRadius: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
});

export default TermsConditionScreen;
