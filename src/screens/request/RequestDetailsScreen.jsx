import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    TextInput,
    Platform,
    Linking,
    Alert, // Added Alert
    Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyBc9YbbzICoaIYZDF0EcPT4MnDkKZAzvnk';

const RequestDetailsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};

    const [isAccepted, setIsAccepted] = useState(false);
    const [otp, setOtp] = useState('');
    const [isServiceStarted, setIsServiceStarted] = useState(false);
    const [isPaymentReceived, setIsPaymentReceived] = useState(false); // New state for payment tracking
    const [showRefundModal, setShowRefundModal] = useState(false);

    // Fixed Start Location: Orabelle Bhoomi Infracon, Ravet
    const doctorLocation = {
        latitude: 18.6433,
        longitude: 73.7366,
    };

    // Patient Location from request or fallback
    // Assuming request.location might be an object {latitude, longitude} or undefined for now
    // If it's a string address in your real data, we'll need geocoding or just pass the address string to valid maps scheme
    const mapRef = React.useRef(null);

    // Patient Location from request or fallback
    const patientLocation = (request?.location && typeof request.location === 'object' && request.location.latitude) ? {
        latitude: request.location.latitude,
        longitude: request.location.longitude,
    } : {
        // Fallback to near doctor location if missing or invalid, to avoid San Francisco routing errors
        latitude: 18.6400,
        longitude: 73.7300,
    };

    if (!request) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.text }}>No request data found.</Text>
            </SafeAreaView>
        )
    }

    const handleAccept = async () => {
        setIsAccepted(true);
        try {
            await firestore()
                .collection('doctors')
            await firestore()
                .collection('doctors')
                .doc('100008') // Using hardcoded ID to match MyRequestScreen
                .collection('patients')
                .doc(request.id)
                .update({
                    status: 'Partially Accepted'
                });
        } catch (error) {
            console.error('Error accepting request:', error);
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleReject = async () => {
        try {
            await firestore()
                .collection('doctors')
            await firestore()
                .collection('doctors')
                .doc('100008') // Using hardcoded ID to match MyRequestScreen
                .collection('patients')
                .doc(request.id)
                .update({
                    status: 'Rejected'
                });
            navigation.goBack();
        } catch (error) {
            console.error('Error rejecting request:', error);
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleCancelVisit = () => {
        // setIsAccepted(false); // Old: Just reset state
        setShowRefundModal(true); // New: Show confirmation modal
    };

    const handleConfirmRefund = () => {
        setShowRefundModal(false);
        // Navigate to Refund Screen
        navigation.navigate('RefundScreen', { amount: '500' });
    };

    const handleStartService = () => {
        if (otp.length !== 5) { // Assuming 5 digit OTP as per input maxLength
            Alert.alert('Invalid OTP', 'Please enter a valid 5-digit OTP.');
            return;
        }
        // In real app, verify OTP with backend here
        Alert.alert('Success', 'Service Started!');
        setIsServiceStarted(true);
    };

    const handleCompleteService = () => {
        navigation.navigate('PrescriptionScreen', { request });
    };

    const openGoogleMapsNavigation = () => {
        // origin: Orabeele Bhoomi Infracon Ravet
        // destination: Patient Location (either lat,long or address string if available)

        let destinationQuery = '';
        if (request?.location?.latitude && request?.location?.longitude) {
            destinationQuery = `${request.location.latitude},${request.location.longitude}`;
        } else if (typeof request?.location === 'string') {
            destinationQuery = encodeURIComponent(request.location);
        } else {
            // Fallback if no valid location data
            destinationQuery = `${patientLocation.latitude},${patientLocation.longitude}`;
        }

        // Using origin name instead of cords for better UX in Maps app if possible, or we can use fixed cords
        // "Orabeele Bhoomi Infracon Ravet"
        const originQuery = 'Orabeele+Bhoomi+Infracon+Ravet';

        const url = `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destinationQuery}&travelmode=driving`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Google Maps is not supported on this device.');
            }
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={[styles.backIcon, { color: theme.colors.text }]}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Active Request</Text>
                <View style={{ width: 40 }} />
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

                {/* Payment Waiting & OTP Section */}
                {isAccepted && !isPaymentReceived && (
                    <View style={[styles.card, { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2', borderWidth: 1 }]}>
                        <Text style={[styles.label, { color: '#E65100', textAlign: 'center', fontWeight: 'bold' }]}>
                            Waiting for patient to make advance payment...
                        </Text>
                        <Text style={[styles.infoText, { color: '#E65100', textAlign: 'center', marginTop: 5 }]}>
                            Do not start service until payment is confirmed.
                        </Text>

                        {/* Simulation Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#FFA726', marginTop: 15, marginHorizontal: 40 }]}
                            onPress={() => setIsPaymentReceived(true)}
                        >
                            <Text style={styles.buttonText}>Simulate Payment Received</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isAccepted && isPaymentReceived && !isServiceStarted && (
                    <View style={styles.otpContainer}>
                        <Text style={styles.otpLabel}>Enter otp before starting the service</Text>
                        <View style={styles.otpInputContainer}>
                            <TextInput
                                style={styles.otpInput}
                                placeholder="_ _ _ _ _"
                                placeholderTextColor="#E0E0E0"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={5}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#32CD32', marginTop: 15 }]}
                            onPress={handleStartService}
                        >
                            <Text style={styles.buttonText}>Start Service</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isAccepted && isServiceStarted && (
                    <View style={styles.otpContainer}>
                        <Text style={[styles.otpLabel, { fontSize: 18, fontWeight: 'bold' }]}>
                            Consultation in Progress
                        </Text>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#4B2E83', marginTop: 15 }]}
                            onPress={handleCompleteService}
                        >
                            <Text style={styles.buttonText}>Complete & Prescribe</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Live Tracking Title & Navigate Button */}
                <View style={styles.trackingHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>Live Tracking</Text>
                    <TouchableOpacity
                        style={[styles.navigateButton, { backgroundColor: '#4285F4' }]}
                        onPress={openGoogleMapsNavigation}
                    >
                        <Text style={styles.navigateButtonText}>Navigate 📍</Text>
                    </TouchableOpacity>
                </View>

                {/* Map View */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: (doctorLocation.latitude + patientLocation.latitude) / 2,
                            longitude: (doctorLocation.longitude + patientLocation.longitude) / 2,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        }}
                        toolbarEnabled={true}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                    >
                        <Marker coordinate={doctorLocation} title="Orabelle Bhoomi Infracon" description="Start Location" pinColor="blue" />
                        <Marker coordinate={patientLocation} title={request.patientName} description="Patient Location" pinColor="red" />
                        <MapViewDirections
                            origin={doctorLocation}
                            destination={patientLocation}
                            apikey={GOOGLE_MAPS_APIKEY}
                            strokeWidth={4}
                            strokeColor="#4A90E2"
                            onStart={(params) => {
                                console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                            }}
                            onReady={result => {
                                // Fit map to coordinates
                                mapRef.current.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        right: (width / 10),
                                        bottom: (height / 10),
                                        left: (width / 10),
                                        top: (height / 10),
                                    }
                                });
                            }}
                            onError={(errorMessage) => {
                                console.log('MapViewDirections Error:', errorMessage);
                                Alert.alert('Route Error', errorMessage);
                            }}
                        />
                    </MapView>
                </View>

            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
                {!isAccepted ? (
                    <>
                        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAccept}>
                            <Text style={styles.buttonText}>ACCEPT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton, { borderColor: '#FF6347', borderWidth: 1 }]}
                            onPress={handleReject}
                        >
                            <Text style={[styles.buttonText, { color: '#FF6347' }]}>REJECT</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelVisit}>
                        <Text style={styles.buttonText}>Cancel Visit</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Refund Confirmation Modal */}
            <Modal
                transparent={true}
                visible={showRefundModal}
                animationType="fade"
                onRequestClose={() => setShowRefundModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                            To cancel the request, we must refund the patient's advance payment.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalRejectButton]}
                                onPress={() => setShowRefundModal(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: '#FF6347' }]}>REJECT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalAcceptButton]}
                                onPress={handleConfirmRefund}
                            >
                                <Text style={styles.modalButtonText}>ACCEPT</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingTop: Platform.OS === 'android' ? 40 : 15,
        paddingBottom: 15,
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
        borderRadius: 15,
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
    trackingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    navigateButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 2,
    },
    navigateButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
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
    cancelButton: {
        backgroundColor: '#9370DB',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    otpContainer: {
        backgroundColor: '#9370DB',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    otpLabel: {
        color: 'white',
        fontSize: 16,
        marginBottom: 10,
    },
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    otpInput: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        minWidth: 100,
        textAlign: 'center',
        paddingBottom: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: 'black',
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    modalRejectButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#FF6347',
    },
    modalAcceptButton: {
        backgroundColor: '#32CD32',
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default RequestDetailsScreen;
