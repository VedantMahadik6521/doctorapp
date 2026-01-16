import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Mock Data matching the screenshot
const REQUESTS_DATA = [
    {
        id: '1',
        name: 'Siya Patil',
        healthIssue: 'General Check-up',
        symptoms: 'Fever & Body Pain',
        distance: '1.5 km Away',
        status: 'New',
        image: 'https://randomuser.me/api/portraits/women/44.jpg', // Placeholder
    },
    {
        id: '2',
        name: 'Vedant Patil',
        healthIssue: 'General Check-up',
        symptoms: 'Fever & Body Pain',
        distance: '1.5 km Away',
        status: 'Follow Up',
        image: 'https://randomuser.me/api/portraits/women/44.jpg', // Same user as per screenshot
    },
];

const MyRequestScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRequests = REQUESTS_DATA.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderRequestItem = ({ item }) => {
        const isNew = item.status === 'New';
        const statusColor = isNew ? '#32CD32' : '#FF6347'; // Green for New, Red for Follow Up

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <View style={styles.cardHeader}>
                    <Image source={{ uri: item.image }} style={styles.avatar} />
                    <View style={styles.cardContent}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
                            <Text style={[styles.status, { color: statusColor }]}>{item.status}</Text>
                        </View>
                        <Text style={[styles.healthIssue, { color: theme.colors.text }]}>
                            <Text style={{ fontWeight: 'bold' }}>Health Issue: </Text>
                            {item.healthIssue}
                        </Text>
                        <Text style={[styles.symptoms, { color: theme.colors.textSecondary }]}>{item.symptoms}</Text>
                        <Text style={[styles.distance, { color: theme.colors.primary }]}>{item.distance}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity style={[styles.detailsButton, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.detailsButtonText}>More Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('HomeTab')}>
                    <Text style={[styles.backIcon, { color: theme.colors.text }]}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Request</Text>
                <View style={{ width: 24 }} />{/* Spacer for centering */}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        placeholder="Search Doctor Here..."
                        placeholderTextColor={theme.colors.textSecondary}
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.colors.card }]}>
                    <Text style={{ fontSize: 18, color: theme.colors.text }}>⚡</Text>
                </TouchableOpacity>
            </View>

            {/* Request List */}
            <FlatList
                data={filteredRequests}
                renderItem={renderRequestItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 10,
    },
    backIcon: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginVertical: 15,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12, // More rounded as per screenshot
        paddingHorizontal: 15,
        height: 50,
        elevation: 2, // Shadow for android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    filterButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        elevation: 2,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30, // Circular
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
    },
    healthIssue: {
        fontSize: 13,
        marginBottom: 2,
    },
    symptoms: {
        fontSize: 12,
        marginBottom: 5,
    },
    distance: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 5
    },
    detailsButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    detailsButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default MyRequestScreen;
