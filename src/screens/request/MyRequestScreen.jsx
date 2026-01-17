import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const MyRequestScreen = () => {
    // 🔥 ALL HOOKS AT TOP (VERY IMPORTANT)
    const { theme } = useTheme();
    const navigation = useNavigation();

    const [searchQuery, setSearchQuery] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔥 useEffect AFTER hooks
    useEffect(() => {
        const user = auth().currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = firestore()
            .collection('patients')
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                snapshot => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setRequests(data);
                    setLoading(false);
                },
                error => {
                    console.error('Firestore error:', error);
                    setLoading(false);
                }
            );

        return unsubscribe;
    }, []);

    // 🔥 SAFE RENDER CONDITIONS (AFTER HOOKS)
    if (loading) {
        return (
            <SafeAreaView style={styles.loader}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    const filteredRequests = requests.filter(item =>
        item.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderRequestItem = ({ item }) => {
        const isNew = item.status === 'New';
        const statusColor = isNew ? '#32CD32' : '#FF6347';

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <View style={styles.cardHeader}>
                    <Image source={{ uri: item.patientImage }} style={styles.avatar} />
                    <View style={styles.cardContent}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.name, { color: theme.colors.text }]}>
                                {item.patientName}
                            </Text>
                            <Text style={[styles.status, { color: statusColor }]}>
                                {item.status}
                            </Text>
                        </View>

                        <Text style={[styles.healthIssue, { color: theme.colors.text }]}>
                            <Text style={{ fontWeight: 'bold' }}>Health Issue: </Text>
                            {item.healthIssue}
                        </Text>

                        <Text style={[styles.symptoms, { color: theme.colors.textSecondary }]}>{item.symptoms}</Text>
                        <Text style={[styles.distance, { color: theme.colors.primary }]}>
                            {item.distance}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={[styles.detailsButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() =>
                            navigation.navigate('RequestDetails', { request: item })
                        }
                    >
                        <Text style={styles.detailsButtonText}>More Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backIcon, { color: theme.colors.text }]}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Requests</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        placeholder="Search Patient..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.searchInput, { color: theme.colors.text }]}
                    />
                </View>
            </View>

            <FlatList
                data={filteredRequests}
                renderItem={renderRequestItem}
                keyExtractor={item => item.id}
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
