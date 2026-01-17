import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const RequestDetailsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};

    // Mock locations if not provided (Doctor and Patient)
    const doctorLocation = {
        latitude: 37.78825,
        longitude: -122.4324,
    };

    const patientLocation = {
        latitude: 37.75825,
        longitude: -122.4624,
    };

    if (!request) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.text }}>No request data found.</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backIcon, { color: theme.colors.text }]}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Active Request</Text>
                <View style={{ width: 40 }} />
                {/* Placeholder for right icons like heart/share if needed */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Patient Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        <Text style={{ fontWeight: 'bold' }}>Name of Patient </Text>
                        {request.patientName}
                    </Text>
                    <Text style={[styles.subLabel, { color: theme.colors.textSecondary }]}>
                        Appointment & Visit info
                    </Text>
                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                        Expected: Today Nov 27, 2025
                    </Text>
                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                        Time: 3:00 PM - 4:00 PM
                    </Text>
                </View>

                {/* Request Reason Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        Request: {request.healthIssue}
                    </Text>
                </View>

                {/* Live Tracking Title */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Live Tracking</Text>

                {/* Map View */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: (doctorLocation.latitude + patientLocation.latitude) / 2,
                            longitude: (doctorLocation.longitude + patientLocation.longitude) / 2,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        <Marker coordinate={doctorLocation} title="You (Doctor)" pinColor="blue" />
                        <Marker coordinate={patientLocation} title={request.patientName} pinColor="red" />
                        <Polyline
                            coordinates={[doctorLocation, patientLocation]}
                            strokeColor="#4A90E2" // Blue path
                            strokeWidth={4}
                        />
                    </MapView>
                </View>

            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity style={[styles.actionButton, styles.acceptButton]}>
                    <Text style={styles.buttonText}>ACCEPT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton, { borderColor: '#FF6347', borderWidth: 1 }]}>
                    <Text style={[styles.buttonText, { color: '#FF6347' }]}>REJECT</Text>
                </TouchableOpacity>
            </View>
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
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    backIcon: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        borderRadius: 15, // Smooth corners
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    subLabel: {
        fontSize: 14,
        marginTop: 5,
        marginBottom: 2,
        fontWeight: '600',
    },
    infoText: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 15,
    },
    mapContainer: {
        height: 300,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    footer: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 30,
    },
    actionButton: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginHorizontal: 10,
    },
    acceptButton: {
        backgroundColor: '#32CD32',
    },
    rejectButton: {
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default RequestDetailsScreen;
