import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    Alert,
    Modal
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// End Service Verification Added
const PrescriptionScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};
    console.log('Request Data:', JSON.stringify(request, null, 2));

    const [name, setName] = useState(request?.patientName || '');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState(request?.gender || request?.Gender || request?.sex || '');
    const [patientType, setPatientType] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medicineInput, setMedicineInput] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [instructions, setInstructions] = useState('');
    const [otp, setOtp] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [showPatientTypeModal, setShowPatientTypeModal] = useState(false);



    useEffect(() => {
        if (request?.dob) {
            // User requested logic: take last 4 digits of "DD-MM-YYYY"
            const dobString = String(request.dob);
            const dobYear = parseInt(dobString.slice(-4), 10);

            if (!isNaN(dobYear)) {
                const currentYear = new Date().getFullYear();
                const calculatedAge = currentYear - dobYear;
                if (calculatedAge >= 0) {
                    setAge(calculatedAge.toString());
                }
            }
        }
    }, [request]);

    const addMedicine = () => {
        if (medicineInput.trim() === '') {
            return;
        }
        const newMedicine = {
            id: Date.now().toString(),
            name: medicineInput,
            dosage: {
                breakfast: 'no', // 'after', 'before', 'no'
                lunch: 'no',
                dinner: 'no'
            }
        };
        setMedicines([...medicines, newMedicine]);
        setMedicineInput('');
    };

    const removeMedicine = (id) => {
        setMedicines(medicines.filter(m => m.id !== id));
    };

    const updateDosage = (id, meal, type) => {
        const updatedMedicines = medicines.map(med => {
            if (med.id === id) {
                return {
                    ...med,
                    dosage: {
                        ...med.dosage,
                        [meal]: type
                    }
                };
            }
            return med;
        });
        setMedicines(updatedMedicines);
    };

    const [isWaitingForPatient, setIsWaitingForPatient] = useState(false);

    // Listen for Patient Verification
    useEffect(() => {
        let unsubscribe;

        if (isWaitingForPatient && request?.id) {
            const currentUser = auth().currentUser;
            if (currentUser) {
                const requestRef = firestore()
                    .collection('doctors')
                    .doc(currentUser.uid)
                    .collection('patients')
                    .doc(request.id);

                unsubscribe = requestRef.onSnapshot((doc) => {
                    const data = doc.data();
                    if (data && data.isPatientVerified === true) {
                        // Patient verified! Complete service.
                        completeService();
                    }
                });
            }
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [isWaitingForPatient, request]);

    const handleSave = async () => {
        if (!name || !age || !gender || !patientType) {
            Alert.alert('Missing Details', 'Please fill in patient details (Name, Age, Gender, Patient Type).');
            return;
        }
        if (medicines.length === 0) {
            Alert.alert('No Medicines', 'Please add at least one medicine.');
            return;
        }

        const prescriptionData = {
            patientName: name,
            age,
            gender,
            patientType,
            diagnosis,
            medicines,
            instructions,
            date: new Date().toISOString()
        };

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setOtp(generatedOtp);

        try {
            const currentUser = auth().currentUser;
            if (currentUser) {
                await firestore()
                    .collection('doctors')
                    .doc(currentUser.uid)
                    .collection('patients')
                    .doc(request.id)
                    .update({
                        prescription: prescriptionData,
                        completionOtp: generatedOtp,
                        isPatientVerified: false
                    });

                setIsSaved(true);
                setIsWaitingForPatient(true);
                Alert.alert('Prescription Saved', 'Share the generated OTP with the patient to complete the service.');
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            Alert.alert('Error', 'Failed to save prescription.');
        }
    };

    const completeService = async () => {
        // No OTP check needed here as this is triggered by Listener verification
        try {
            const currentUser = auth().currentUser;
            if (!currentUser) return;

            // Prepare Record Data
            const recordData = {
                patientId: request?.id || 'unknown_patient', // Default if missing
                doctorId: currentUser.uid,
                healthIssue: request?.healthIssue || 'General Check-up',
                patientImage: request?.patientImage || null, // Capture image too if possible
                reportPrescription: {
                    patientName: name,
                    age,
                    gender,
                    patientType,
                    diagnosis,
                    medicines,
                    instructions,
                    date: new Date().toISOString()
                },
                review: '',
                requestId: request?.requestId || request?.id || 'unknown_request',
                completedAt: firestore.FieldValue.serverTimestamp(),
            };

            await firestore().runTransaction(async (transaction) => {
                const newRecordRef = firestore()
                    .collection('doctors')
                    .doc(currentUser.uid)
                    .collection('records')
                    .doc();
                const patientRequestRef = firestore()
                    .collection('doctors')
                    .doc(currentUser.uid)
                    .collection('patients')
                    .doc(request.id);

                // 1. Create Record
                transaction.set(newRecordRef, recordData);

                // 2. Delete Request from Patients
                transaction.delete(patientRequestRef);
            });

            console.log('Service Completed via Patient Verification');
            setIsWaitingForPatient(false); // Stop listening
            Alert.alert('Service Completed', 'The request has been successfully completed and moved to records!', [
                { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
            ]);

        } catch (error) {
            console.error('Completion Error:', error);
            Alert.alert('Error', 'Failed to complete service. Please ensure connectivity.');
        }
    };

    const renderDosageRow = (medicineId, meal, currentVal) => (
        <View style={styles.dosageRow}>
            <Text style={[styles.dosageLabel, { color: theme.colors.text }]}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>

            <View style={styles.checkboxGroup}>
                <TouchableOpacity
                    style={styles.checkboxOption}
                    onPress={() => updateDosage(medicineId, meal, 'after')}
                >
                    <Text style={{ color: theme.colors.text, fontSize: 12, marginRight: 5 }}>After</Text>
                    <View style={[styles.checkbox, currentVal === 'after' && { backgroundColor: theme.colors.primary }]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.checkboxOption}
                    onPress={() => updateDosage(medicineId, meal, 'before')}
                >
                    <Text style={{ color: theme.colors.text, fontSize: 12, marginRight: 5 }}>Before</Text>
                    <View style={[styles.checkbox, currentVal === 'before' && { backgroundColor: theme.colors.primary }]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.checkboxOption}
                    onPress={() => updateDosage(medicineId, meal, 'no')}
                >
                    <Text style={{ color: theme.colors.text, fontSize: 12, marginRight: 5 }}>No</Text>
                    <View style={[styles.checkbox, currentVal === 'no' && { backgroundColor: theme.colors.primary }]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backIcon, { color: theme.colors.text }]}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Prescription</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Patient Details */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Patient Details</Text>

                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Name</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                    placeholder="Patient Name"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 5 }}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Age</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                            placeholder="Age"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 5 }}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Gender</Text>
                        <TouchableOpacity
                            style={[styles.input, { backgroundColor: theme.colors.card, justifyContent: 'center' }]}
                            onPress={() => setShowGenderModal(true)}
                        >
                            <Text style={{ color: gender ? theme.colors.text : theme.colors.textSecondary }}>
                                {gender || "Gender"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Type</Text>
                        <TouchableOpacity
                            style={[styles.input, { backgroundColor: theme.colors.card, justifyContent: 'center' }]}
                            onPress={() => setShowPatientTypeModal(true)}
                        >
                            <Text style={{ color: patientType ? theme.colors.text : theme.colors.textSecondary }}>
                                {patientType || "Type"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Diagnosis and Notes */}
                <Text style={[styles.inputLabel, { color: theme.colors.text, marginTop: 10 }]}>Diagnosis and notes</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, height: 80, textAlignVertical: 'top' }]}
                    placeholder="Diagnosis and notes"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={diagnosis}
                    onChangeText={setDiagnosis}
                    multiline={true}
                />

                {/* Medicines */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>Medicines</Text>
                <View style={styles.addMedicineContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10, backgroundColor: theme.colors.card, color: theme.colors.text }]}
                        placeholder="Medicine Name"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={medicineInput}
                        onChangeText={setMedicineInput}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Medicine List */}
                {medicines.map((med) => (
                    <View key={med.id} style={[styles.medicineCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.medicineHeader}>
                            <Text style={[styles.medicineName, { color: theme.colors.text }]}>{med.name}</Text>
                            <TouchableOpacity onPress={() => removeMedicine(med.id)}>
                                <Text style={{ color: '#FF6347', fontWeight: 'bold' }}>Remove</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.dosageTitle, { color: theme.colors.textSecondary }]}>Duration:</Text>

                        {renderDosageRow(med.id, 'breakfast', med.dosage.breakfast)}
                        {renderDosageRow(med.id, 'lunch', med.dosage.lunch)}
                        {renderDosageRow(med.id, 'dinner', med.dosage.dinner)}
                    </View>
                ))}

                {/* Instructions */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>Instructions</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                    placeholder="Additional instructions..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={instructions}
                    onChangeText={setInstructions}
                    multiline
                />

                {!isSaved ? (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Prescription</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.otpSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
                            End Service Verification
                        </Text>
                        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                            Share this OTP with the patient
                        </Text>

                        <Text style={[styles.otpDisplay, { color: theme.colors.primary }]}>
                            {otp}
                        </Text>

                        <View style={styles.waitingContainer}>
                            <Text style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }}>
                                Waiting for patient to verify...
                            </Text>
                            {/* Optional: Simple spinner or loader could go here */}
                        </View>
                    </View>
                )}

            </ScrollView>

            <Modal
                transparent={true}
                visible={showGenderModal}
                animationType="fade"
                onRequestClose={() => setShowGenderModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGenderModal(false)}
                >
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Gender</Text>

                        {['Male', 'Female'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.modalOption}
                                onPress={() => {
                                    setGender(option);
                                    setShowGenderModal(false);
                                }}
                            >
                                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                transparent={true}
                visible={showPatientTypeModal}
                animationType="fade"
                onRequestClose={() => setShowPatientTypeModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPatientTypeModal(false)}
                >
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Patient Type</Text>

                        {['Chronic', 'Acute'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.modalOption}
                                onPress={() => {
                                    setPatientType(option);
                                    setShowPatientTypeModal(false);
                                }}
                            >
                                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
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
    content: {
        padding: 20,
        paddingBottom: 50,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    row: {
        flexDirection: 'row',
    },
    addMedicineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    addButton: {
        backgroundColor: '#4B2E83',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    medicineCard: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    medicineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    medicineName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    dosageTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 10,
    },
    dosageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dosageLabel: {
        fontSize: 14,
        fontWeight: '500',
        width: 70,
    },
    checkboxGroup: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-around',
    },
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 4,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#4B2E83',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    otpSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 20,
    },
    otpInput: {
        textAlign: 'center',
        fontSize: 18,
        letterSpacing: 5,
        fontWeight: 'bold',
    },
    otpDisplay: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        letterSpacing: 5,
    },
    waitingContainer: {
        alignItems: 'center',
        padding: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        borderRadius: 15,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    },
    modalOptionText: {
        fontSize: 16,
    },
});

export default PrescriptionScreen;
