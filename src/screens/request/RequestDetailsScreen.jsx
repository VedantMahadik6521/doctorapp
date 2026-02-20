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
import NotificationService from '../../services/NotificationService';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyBc9YbbzICoaIYZDF0EcPT4MnDkKZAzvnk';

// Fixed Start Location: Orabelle Bhoomi Infracon, Ravet
const doctorLocation = {
    latitude: 18.6433,
    longitude: 73.7366,
};

const RequestDetailsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};

    const [isAccepted, setIsAccepted] = useState(
        ['Partially Accepted', 'Accepted', 'In Progress'].includes(request?.status)
    );
    const [otp, setOtp] = useState('');
    const [isServiceStarted, setIsServiceStarted] = useState(
        request?.status === 'In Progress'
    );
    const [isPaymentReceived, setIsPaymentReceived] = useState(
        request?.status === 'In Progress'
    ); // New state for payment tracking
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(doctorLocation); // Initialize directly
    const [isNavigating, setIsNavigating] = useState(false);

    // Initialize currentLocation with doctorLocation if not set
    // AND try to get actual location immediately
    // Enable live tracking immediately to sync with Blue Dot
    React.useEffect(() => {
        let watchId = null;

        const startTracking = async () => {
            let granted = false;
            if (Platform.OS === 'ios') {
                const auth = await Geolocation.requestAuthorization('whenInUse');
                granted = auth === 'granted';
            } else {
                try {
                    const auth = await Geolocation.requestAuthorization('whenInUse');
                    granted = auth === 'granted';
                } catch (err) {
                    console.warn(err);
                }
            }

            if (granted) {
                watchId = Geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentLocation({ latitude, longitude });
                    },
                    (error) => {
                        console.log('Error watching location:', error);
                    },
                    {
                        enableHighAccuracy: true,
                        distanceFilter: 10,
                        interval: 5000,
                        fastestInterval: 2000,
                        showLocationDialog: true,
                        forceRequestLocation: true
                    }
                );
            }
        };

        startTracking();

        return () => {
            if (watchId !== null) {
                Geolocation.clearWatch(watchId);
            }
        };
    }, []);

    // Patient Location from request or fallback
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
            const currentUser = auth().currentUser;
            if (!currentUser) return;

            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
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
            const currentUser = auth().currentUser;
            if (!currentUser) return;

            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
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
        navigation.navigate('RefundScreen', {
            amount: request?.advancePaymentAmount || '0',
            upiId: request?.upiId || ''
        });
    };

    const handleStartService = async () => {
        if (otp.length !== 5) { // Assuming 5 digit OTP as per input maxLength
            Alert.alert('Invalid OTP', 'Please enter a valid 5-digit OTP.');
            return;
        }

        try {
            const currentUser = auth().currentUser;
            if (!currentUser) return;

            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
                .collection('patients')
                .doc(request.id)
                .update({
                    status: 'In Progress'
                });

            // In real app, verify OTP with backend here
            Alert.alert('Success', 'Service Started!');
            setIsServiceStarted(true);

        } catch (error) {
            console.error('Error starting service:', error);
            Alert.alert('Error', 'Failed to start service');
        }
    };

    // New function to simulate payment and trigger cloud function
    const handleSimulatePayment = async () => {
        try {
            const currentUser = auth().currentUser;
            if (!currentUser) return;

            // 1. Update UI state immediately
            setIsPaymentReceived(true);

            // 2. Update Doctor's subcollection (This NOW triggers the Cloud Function)
            // Path: doctors/{uid}/patients/{requestId}
            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
                .collection('patients')
                .doc(request.id)
                .update({
                    isPaymentReceived: true,
                    advancePaid: true,
                    advancePaymentStatus: 'Completed',
                    advancePaymentAmount: 500
                });

            // Note: Cloud Function now listens to this path: doctors/{doctorId}/patients/{requestId}
            // So it will detect this update and send the notification.

            Alert.alert('Success', 'Payment simulated & Notification sent (via Backend).');

        } catch (error) {
            console.error("Error simulating payment:", error);
            Alert.alert('Error', 'Failed to update payment status.');
        }
    };

    // New function to handle arrival
    const handleArrived = async () => {
        try {
            // Example update - adjust based on your actual data model if needed
            // Using current request object structure
            // Note: You might need to add a 'doctorReached' field to your request document in Firestore if it doesn't exist
            // For now, I'll assume we are updating the request status or a specific field

            // If you want to update 'doctorReached' in the patient request document:
            const currentUser = auth().currentUser;
            if (!currentUser) return;

            // Find where the request is stored. Based on previous code:
            // doctors/{uid}/patients/{requestId}

            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
                .collection('patients')
                .doc(request.id)
                .update({
                    doctorReached: true,
                    // status: 'Arrived' // Optional: if you have an 'Arrived' status
                });

            NotificationService.displayLocalNotification(
                "You have reached destination",
                "You can now proceed with the visit."
            );

            // Save to Firestore for Notification Screen
            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
                .collection('notifications')
                .add({
                    title: "Reached Destination",
                    message: "You have reached the destination.",
                    timestamp: firestore.FieldValue.serverTimestamp(),
                    type: 'local',
                    read: false
                });

            Alert.alert('Success', 'You have marked yourself as arrived.');

        } catch (error) {
            console.error("Error marking arrival:", error);
            Alert.alert('Error', 'Failed to mark arrival.');
        }
    };

    const handleCompleteService = () => {
        navigation.navigate('PrescriptionScreen', { request });
    };

    const startLiveTracking = () => {
        if (isNavigating) return;
        setIsNavigating(true);

        const requestLocationPermission = async () => {
            if (Platform.OS === 'ios') {
                const auth = await Geolocation.requestAuthorization('whenInUse');
                return auth === 'granted';
            } else {
                // For Android, usually handled by PermissionsAndroid or the library's requestAuthorization
                // But react-native-geolocation-service requestAuthorization works for both if configured
                try {
                    const granted = await Geolocation.requestAuthorization('whenInUse');
                    return granted === 'granted';
                } catch (err) {
                    console.warn(err);
                    return false;
                }
            }
        };

        requestLocationPermission().then(granted => {
            if (granted) {
                Geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentLocation({ latitude, longitude });

                        // Optional: Update firestore with live location if needed for patient to see
                    },
                    (error) => {
                        console.log(error.code, error.message);
                        Alert.alert('Location Error', 'Unable to fetch live location.');
                    },
                    { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
                );
            } else {
                Alert.alert('Permission Denied', 'Location permission is required for live tracking.');
            }
        });
    };

    const openGoogleMapsNavigation = () => {
        startLiveTracking();

        let destinationQuery = '';
        if (request?.location?.latitude && request?.location?.longitude) {
            destinationQuery = `${request.location.latitude},${request.location.longitude}`;
        } else if (typeof request?.location === 'string') {
            destinationQuery = encodeURIComponent(request.location);
        } else {
            // Fallback if no valid location data
            destinationQuery = `${patientLocation.latitude},${patientLocation.longitude}`;
        }

        // Use native navigation intents
        const url = Platform.select({
            ios: `maps://?daddr=${destinationQuery}&dirflg=d`,
            android: `google.navigation:q=${destinationQuery}`
        });

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                // Fallback to web browser if native app not found
                const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}&travelmode=driving`;
                Linking.openURL(browserUrl).catch(err => Alert.alert('Error', 'Could not open maps.'));
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
                            onPress={handleSimulatePayment}
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
                            <Text style={styles.buttonText}>Write Prescription</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Arrived Button */}
                {isAccepted && !isServiceStarted && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FF8C00', marginBottom: 20, alignSelf: 'center', width: '90%' }]}
                        onPress={handleArrived}
                    >
                        <Text style={styles.buttonText}>Mark as Arrived</Text>
                    </TouchableOpacity>
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
                        <Marker coordinate={currentLocation || doctorLocation} title="You" description="Your Location">
                            <View style={styles.customMarkerDoctor}>
                                <Icon name="plus" size={15} color="white" />
                            </View>
                        </Marker>
                        <Marker coordinate={patientLocation} title={request.patientName} description="Patient Location">
                            <View style={styles.customMarkerPatient}>
                                <Icon name="home" size={15} color="white" />
                            </View>
                        </Marker>
                        <MapViewDirections
                            origin={currentLocation || doctorLocation}
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
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            styles.cancelButton,
                            !isPaymentReceived && { backgroundColor: '#B0B0B0', opacity: 0.6 }
                        ]}
                        onPress={handleCancelVisit}
                        disabled={!isPaymentReceived}
                    >
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
    customMarkerDoctor: {
        backgroundColor: '#4285F4', // Blue
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customMarkerPatient: {
        backgroundColor: '#FF6347', // Red
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RequestDetailsScreen;
