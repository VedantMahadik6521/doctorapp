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
    Modal,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const MyRequestScreen = () => {
    // 🔥 ALL HOOKS AT TOP (VERY IMPORTANT)
    const { theme } = useTheme();
    const navigation = useNavigation();

    const [searchQuery, setSearchQuery] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    // Dynamic Doctor Location State (Initialized with Fallback: Orabelle Bhoomi Infracon)
    const [currentDoctorLocation, setCurrentDoctorLocation] = useState({
        latitude: 18.6433,
        longitude: 73.7366,
    });

    // Filter States
    const [modalVisible, setModalVisible] = useState(false);
    const [sortBy, setSortBy] = useState('Oldest First');
    const [filterStatus, setFilterStatus] = useState([]);
    const [filterDistance, setFilterDistance] = useState([]);

    // Temporary Filter States (for Modal)
    const [tempSortBy, setTempSortBy] = useState('Oldest First');
    const [tempFilterStatus, setTempFilterStatus] = useState([]);
    const [tempFilterDistance, setTempFilterDistance] = useState([]);

    const openFilterModal = () => {
        setTempSortBy(sortBy);
        setTempFilterStatus([...filterStatus]);
        setTempFilterDistance([...filterDistance]);
        setModalVisible(true);
    };

    const applyFilters = () => {
        setSortBy(tempSortBy);
        setFilterStatus(tempFilterStatus);
        setFilterDistance(tempFilterDistance);
        setModalVisible(false);
    };

    // 🔥 useEffect AFTER hooks
    useEffect(() => {
        const user = auth().currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        // Change: Use the dynamic user.uid
        const unsubscribe = firestore()
            .collection('doctors')
            .doc(user.uid)
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

        // Fetch Doctor Location
        const fetchDoctorLocation = async () => {
            try {
                const docSnap = await firestore()
                    .collection('doctors')
                    .doc(user.uid)
                    .get();

                if (docSnap.exists) {
                    const docData = docSnap.data();
                    if (docData?.location && docData.location.latitude && docData.location.longitude) {
                        setCurrentDoctorLocation({
                            latitude: docData.location.latitude,
                            longitude: docData.location.longitude
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching doctor location:", err);
                // Fallback remains as initialized
            }
        };

        fetchDoctorLocation();

        return unsubscribe;
    }, []);


    // Helper to get coords from string address (Mock Geocoding)
    const getCoordinatesFromAddress = (address) => {
        if (!address) return null;

        const lowerAddr = address.toLowerCase();

        // Pimple Saudagar
        if (lowerAddr.includes('pimple saudagar')) {
            return { latitude: 18.5987, longitude: 73.7978 };
        }
        // Pune
        if (lowerAddr.includes('pune')) {
            return { latitude: 18.5204, longitude: 73.8567 };
        }
        // Wakad
        if (lowerAddr.includes('wakad')) {
            return { latitude: 18.5983, longitude: 73.7638 };
        }
        // Hinjewadi
        if (lowerAddr.includes('hinjewadi')) {
            return { latitude: 18.5913, longitude: 73.7389 };
        }

        return null;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180)
    }

    const calculateDistance = (lat1, lon1, locationData) => {
        let lat2, lon2;

        if (typeof locationData === 'object' && locationData?.latitude) {
            lat2 = locationData.latitude;
            lon2 = locationData.longitude;
        } else if (typeof locationData === 'string') {
            const coords = getCoordinatesFromAddress(locationData);
            if (coords) {
                lat2 = coords.latitude;
                lon2 = coords.longitude;
            }
        }

        // Fallback if still no coords
        if (!lat2 || !lon2) {
            // Fallback to avoid N/A for demo
            lat2 = 18.6400;
            lon2 = 73.7300;
        }

        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    // Helper wrapper for UI display
    const getDistanceFromLatLonInKm = (lat1, lon1, locationData) => {
        const d = calculateDistance(lat1, lon1, locationData);
        return d.toFixed(1) + " km Away";
    }



    // 🔥 SAFE RENDER CONDITIONS (AFTER HOOKS)
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loader, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    const toggleStatusFilter = (status) => {
        if (tempFilterStatus.includes(status)) {
            setTempFilterStatus(tempFilterStatus.filter(s => s !== status));
        } else {
            setTempFilterStatus([...tempFilterStatus, status]);
        }
    };

    const toggleDistanceFilter = (distance) => {
        if (tempFilterDistance.includes(distance)) {
            setTempFilterDistance(tempFilterDistance.filter(d => d !== distance));
        } else {
            setTempFilterDistance([...tempFilterDistance, distance]);
        }
    };

    const filteredRequests = requests.filter(item => {
        // Search
        if (searchQuery && !item.patientName?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Status Filter
        if (filterStatus.length > 0 && !filterStatus.includes(item.status)) {
            return false;
        }

        // Distance Filter
        if (filterDistance.length > 0) {
            const dist = calculateDistance(currentDoctorLocation.latitude, currentDoctorLocation.longitude, item.location);
            const matchesUnder2 = filterDistance.includes('Under 2km') && dist < 2;
            const matchesUnder5 = filterDistance.includes('Under 5km') && dist < 5;

            let distanceMatch = false;
            if (filterDistance.includes('Under 2km') && matchesUnder2) distanceMatch = true;
            if (filterDistance.includes('Under 5km') && matchesUnder5) distanceMatch = true;

            if (!distanceMatch) return false;
        }

        return true;
    }).sort((a, b) => {
        if (sortBy === 'Oldest First') {
            // Ascending
            return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        } else if (sortBy === 'Newest First') {
            // Descending
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        } else if (sortBy === 'Nearest First') {
            const distA = calculateDistance(currentDoctorLocation.latitude, currentDoctorLocation.longitude, a.location);
            const distB = calculateDistance(currentDoctorLocation.latitude, currentDoctorLocation.longitude, b.location);
            return distA - distB;
        }
        return 0;
    });

    const renderRequestItem = ({ item }) => {
        let statusColor = '#FF6347'; // Default Red (Rejected)
        if (item.status === 'New') {
            statusColor = '#32CD32'; // Green
        } else if (item.status === 'Partially Accepted') {
            statusColor = '#FFA500'; // Orange
        }

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
                            {getDistanceFromLatLonInKm(
                                currentDoctorLocation.latitude,
                                currentDoctorLocation.longitude,
                                item.location
                            )}
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
                    <Icon name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Requests</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
                    <Icon name="search" size={20} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
                    <TextInput
                        placeholder="Search Patient..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.searchInput, { color: theme.colors.text }]}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
                    onPress={openFilterModal}
                >
                    <Icon name="tune" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredRequests}
                renderItem={renderRequestItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />

            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filter Requests</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Icon name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Sort By Section */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sort By</Text>
                        {['Oldest First', 'Newest First', 'Nearest First'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.optionRow}
                                onPress={() => setTempSortBy(option)}
                            >
                                <View style={[
                                    styles.radioCircle,
                                    { borderColor: theme.colors.primary },
                                    tempSortBy === option && { borderColor: theme.colors.primary, backgroundColor: 'white' }
                                ]}>
                                    {tempSortBy === option && <View style={[styles.selectedRb, { backgroundColor: theme.colors.primary }]} />}
                                </View>
                                <Text style={[styles.optionText, { color: theme.colors.text }]}>{option}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                        {/* Filter By Status */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Filter By Status</Text>
                        {['New', 'Partially Accepted', 'Follow Up'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={styles.optionRow}
                                onPress={() => toggleStatusFilter(status)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: theme.colors.primary },
                                    tempFilterStatus.includes(status) && { backgroundColor: theme.colors.primary }
                                ]}>
                                    {tempFilterStatus.includes(status) && <Icon name="check" size={14} color="white" />}
                                </View>
                                <Text style={[styles.optionText, { color: theme.colors.text }]}>{status}</Text>
                            </TouchableOpacity>
                        ))}

                        {/* Filter By Distance */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>Distance Radius</Text>
                        {['Under 2km', 'Under 5km'].map((distance) => (
                            <TouchableOpacity
                                key={distance}
                                style={styles.optionRow}
                                onPress={() => toggleDistanceFilter(distance)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: theme.colors.primary },
                                    tempFilterDistance.includes(distance) && { backgroundColor: theme.colors.primary }
                                ]}>
                                    {tempFilterDistance.includes(distance) && <Icon name="check" size={14} color="white" />}
                                </View>
                                <Text style={[styles.optionText, { color: theme.colors.text }]}>{distance}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.footerButton, { borderColor: theme.colors.border, borderWidth: 1 }]}
                            onPress={() => {
                                setTempSortBy('Oldest First');
                                setTempFilterStatus([]);
                                setTempFilterDistance([]);
                            }}
                        >
                            <Text style={{ color: theme.colors.text }}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}
                            onPress={applyFilters}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        elevation: 2, // Shadow for android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 10,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 5,
    },
    radioCircle: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    selectedRb: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    checkbox: {
        height: 22,
        width: 22,
        borderRadius: 4,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    optionText: {
        fontSize: 16,
    },
    divider: {
        height: 1,
        marginVertical: 15,
        opacity: 0.2,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    footerButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
});

export default MyRequestScreen;
