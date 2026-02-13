import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    SafeAreaView,
    Linking
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TicketDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { ticket } = route.params || {};
    const { theme } = useTheme();

    if (!ticket) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Ticket Details</Text>
                </View>
                <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: theme.colors.text }}>Ticket not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return '#4CAF50';
            case 'closed': return '#9E9E9E';
            case 'in progress': return '#FFA000';
            default: return theme.colors.primary;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />


            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.isDarkMode ? '#333' : '#f0f0f0' }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Ticket Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Status & ID */}
                <View style={styles.headerSection}>
                    <View>
                        <Text style={[styles.label, { color: theme.colors.textSecondary || '#888' }]}>Ticket ID</Text>
                        <Text style={[styles.value, { color: theme.colors.text }]}>{ticket.ticketId || ticket['ticket id']}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                            {ticket.status}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.isDarkMode ? '#333' : '#eee' }]} />

                {/* Date */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary || '#888' }]}>Date</Text>
                    <Text style={[styles.value, { color: theme.colors.text }]}>
                        {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : 'N/A'}
                    </Text>
                </View>

                {/* Issue Title */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary || '#888' }]}>Issue Title</Text>
                    <Text style={[styles.valueLarge, { color: theme.colors.text }]}>{ticket.issueTitle}</Text>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary || '#888' }]}>Description</Text>
                    <Text style={[styles.description, { color: theme.colors.text }]}>{ticket.DescribeIssue}</Text>
                </View>


                {/* Start Discussion Section */}
                <View style={[styles.discussionSection, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.discussionText, { color: theme.colors.text }]}>
                        If you want to discuss with admin click start discussion
                    </Text>
                    <TouchableOpacity
                        style={[styles.discussionButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('TicketChat', { ticket })}
                    >
                        <Text style={styles.discussionButtonText}>Start Discussion</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        // color handled inline
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    divider: {
        height: 1,
        // color handled inline
        marginBottom: 15,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        color: '#888', // Fallback, override inline if needed
        marginBottom: 5,
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    valueLarge: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#444', // Fallback, override inline if needed
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    discussionSection: {
        marginTop: 40,
        alignItems: 'center',
        padding: 20,
        // backgroundColor: '#f9f9f9', // Removed hardcoded color, handling in component
        borderRadius: 15,
    },
    discussionText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        opacity: 0.7,
    },
    discussionButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    discussionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default TicketDetailsScreen;
