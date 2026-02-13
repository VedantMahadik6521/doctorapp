import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    LayoutAnimation,
    Platform,
    UIManager,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    ActivityIndicator,
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
    {
        question: "How do I book an appointment?",
        answer: "You can book an appointment by selecting a doctor from the home screen and choosing a suitable time slot."
    },
    {
        question: "Can I cancel my appointment?",
        answer: "Yes, you can cancel your appointment from the 'My Requests' section before the scheduled time."
    },
    {
        question: "What if I don't get an OTP?",
        answer: "Please ensure your mobile number is correct. If the issue persists, contact support."
    },
    {
        question: "How do I contact customer support?",
        answer: "You can contact our support team via the details provided above or email us directly at support@doctor4home.com."
    },
    {
        question: "How to add review?",
        answer: "After your consultation is complete, you will see an option to rate and review your experience."
    }
];

const HelpCenterScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [expandedIndex, setExpandedIndex] = useState(null);

    // Ticket State
    const [modalVisible, setModalVisible] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [visits, setVisits] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [issueTitle, setIssueTitle] = useState('');
    const [describeIssue, setDescribeIssue] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showVisitDropdown, setShowVisitDropdown] = useState(false);



    useEffect(() => {
        const user = auth().currentUser;
        if (!user) return;

        // Fetch Tickets Real-time
        const unsubscribeTickets = firestore()
            .collection('doctors')
            .doc(user.uid)
            .collection('Ticket')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const fetchedTickets = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTickets(fetchedTickets);
            }, error => {
                console.error("Error fetching tickets:", error);
            });

        return () => unsubscribeTickets();
    }, []);

    useEffect(() => {
        // Fetch visits (records) for the dropdown
        const fetchVisits = async () => {
            // ... existing fetch visits logic is fine inside useEffect or separate
            // Optimizing to only fetch when modal opens is fine, keeping existing logic attached to modalVisible
            try {
                const user = auth().currentUser;
                if (!user) return;

                // Fetching from 'doctors/{uid}/records' subcollection
                const snapshot = await firestore()
                    .collection('doctors')
                    .doc(user.uid)
                    .collection('records')
                    .orderBy('completedAt', 'desc')
                    .limit(10)
                    .get();

                const visitsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const patientName = data.reportPrescription?.patientName || 'Unknown Patient';
                    return {
                        id: doc.id,
                        patientName: patientName,
                        healthIssue: data.healthIssue || 'General Check-up',
                        ...data
                    };
                });

                setVisits(visitsData);
            } catch (error) {
                console.error("Error fetching visits: ", error);
            }
        };

        if (modalVisible) {
            fetchVisits();
        }
    }, [modalVisible]);


    const toggleExpand = (index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const handleCreateTicket = async () => {
        if (!issueTitle || !describeIssue || !selectedVisit) {
            Alert.alert("Error", "Please fill in all fields and select a visit.");
            return;
        }

        setSubmitting(true);
        console.log('Creating ticket...');
        try {
            const ticketId = `TID-${Date.now()}`;
            const currentUser = auth().currentUser;

            const ticketData = {
                ticketId: ticketId,
                patientId: selectedVisit.id || 'Unknown',
                doctorId: currentUser ? currentUser.uid : 'Unknown',
                requestId: selectedVisit.id,
                adminId: '',
                issueTitle: issueTitle,
                DescribeIssue: describeIssue,
                status: 'Open',
                createdAt: firestore.FieldValue.serverTimestamp(),
                // Keeping original keys as fallback if backend expects them specifically, though camelCase is preferred
                'ticket id': ticketId,
                'Patient id': selectedVisit.id || 'Unknown',
                'Doctor id': currentUser ? currentUser.uid : 'Unknown',
            };

            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
                .collection('Ticket')
                .add(ticketData);

            console.log('Ticket created successfully');
            Alert.alert("Success", "Ticket created successfully!");
            setModalVisible(false);
            setIssueTitle('');
            setDescribeIssue('');
            setSelectedVisit(null);
        } catch (error) {
            console.error("Error creating ticket: ", error);
            Alert.alert("Error", "Failed to create ticket. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return '#4CAF50'; // Green
            case 'closed': return '#9E9E9E'; // Gray
            case 'in progress': return '#FFA000'; // Amber
            default: return theme.colors.primary;
        }
    };

    const renderTicketItem = (ticket) => (
        <TouchableOpacity
            key={ticket.id}
            style={[styles.ticketItem, { backgroundColor: theme.colors.card }]}
            onPress={() => {
                navigation.navigate('TicketDetails', { ticket });
            }}
        >
            <View style={styles.ticketHeaderRow}>
                <Text style={[styles.ticketId, { color: theme.colors.text }]}>
                    {ticket.ticketId || ticket['ticket id'] || 'No ID'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {ticket.status || 'Open'}
                    </Text>
                </View>
            </View>
            <Text style={[styles.ticketTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {ticket.issueTitle}
            </Text>
            <Text style={styles.ticketDate}>
                {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : 'Just now'}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Previous Tickets Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Previous Tickets</Text>

                {tickets.length > 0 ? (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ height: 320, backgroundColor: theme.isDarkMode ? 'transparent' : '#f9f9f9', borderRadius: 10, padding: 5 }}>
                            <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                                {tickets.map(renderTicketItem)}
                            </ScrollView>
                        </View>
                        <TouchableOpacity style={[styles.createButton, { marginTop: 15 }]} onPress={() => setModalVisible(true)}>
                            <Text style={styles.createButtonText}>Create New Ticket</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.ticketCard, { backgroundColor: theme.colors.card }]}>
                        <Icon name="local-offer" size={40} color="#AAA" style={{ marginBottom: 10 }} />
                        <Text style={[styles.noTicketText, { color: theme.colors.text }]}>No tickets yet</Text>
                        <Text style={styles.ticketSubText}>Create a ticket if you need help with any visit</Text>

                        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
                            <Text style={styles.createButtonText}>Create New Ticket</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Contact Info */}
                <View style={styles.contactContainer}>
                    <View style={styles.contactRow}>
                        <Icon name="call" size={20} color="#7B61FF" style={{ marginRight: 15 }} />
                        <View>
                            <Text style={styles.contactLabel}>Call Us:</Text>
                            <Text style={[styles.contactValue, { color: theme.colors.text }]}>+91 1334 567 890</Text>
                        </View>
                    </View>
                    <View style={styles.contactRow}>
                        <Icon name="email" size={20} color="#7B61FF" style={{ marginRight: 15 }} />
                        <View>
                            <Text style={styles.contactLabel}>Email Us:</Text>
                            <Text style={[styles.contactValue, { color: theme.colors.text }]}>support@doctor4home.com</Text>
                        </View>
                    </View>
                </View>

                {/* FAQ Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>Frequently Asked Questions</Text>
                <View style={styles.faqList}>
                    {FAQS.map((item, index) => {
                        const isExpanded = expandedIndex === index;
                        return (
                            <View key={index} style={[styles.faqItem, { backgroundColor: theme.colors.card }]}>
                                <TouchableOpacity
                                    style={styles.faqHeader}
                                    onPress={() => toggleExpand(index)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{item.question}</Text>
                                    <Icon
                                        name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                        size={20}
                                        color="#888"
                                    />
                                </TouchableOpacity>
                                {isExpanded && (
                                    <View style={styles.faqBody}>
                                        <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>{item.answer}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

            </ScrollView>

            {/* Create Ticket Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create New Ticket</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Select Visit</Text>
                        <TouchableOpacity
                            style={[styles.dropdownSelector, { backgroundColor: theme.isDarkMode ? '#333' : '#F5F5F5' }]}
                            onPress={() => setShowVisitDropdown(!showVisitDropdown)}
                        >
                            <Text style={{ color: selectedVisit ? theme.colors.text : '#999' }}>
                                {selectedVisit ? (selectedVisit.patientName || `Visit #${selectedVisit.id.substr(0, 5)}`) : 'Select a previous visit'}
                            </Text>
                            <Icon name="keyboard-arrow-down" size={20} color="#666" />
                        </TouchableOpacity>

                        {showVisitDropdown && (
                            <View style={[styles.dropdownList, { backgroundColor: theme.colors.card, borderColor: theme.isDarkMode ? '#444' : '#EEE' }]}>
                                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
                                    {/* Other Complaint Option */}
                                    <TouchableOpacity
                                        style={[styles.dropdownItem, { borderBottomColor: theme.isDarkMode ? '#444' : '#EEE' }]}
                                        onPress={() => {
                                            setSelectedVisit({ id: 'other', patientName: 'Other Complaint', healthIssue: 'General Issue' });
                                            setShowVisitDropdown(false);
                                        }}
                                    >
                                        <Text style={[styles.dropdownItemText, { fontWeight: 'bold', color: theme.colors.primary }]}>
                                            Other Complaint
                                        </Text>
                                    </TouchableOpacity>

                                    {visits.length > 0 ? (
                                        visits.map((visit) => (
                                            <TouchableOpacity
                                                key={visit.id}
                                                style={[styles.dropdownItem, { borderBottomColor: theme.isDarkMode ? '#444' : '#EEE' }]}
                                                onPress={() => {
                                                    setSelectedVisit(visit);
                                                    setShowVisitDropdown(false);
                                                }}
                                            >
                                                <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>
                                                    {visit.patientName} - {visit.healthIssue}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View style={{ padding: 15, alignItems: 'center' }}>
                                            <Text style={{ color: '#999' }}>No past visits found</Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )}


                        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Issue Title</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.isDarkMode ? '#333' : '#F5F5F5', color: theme.colors.text }]}
                            placeholder="e.g., Follow-up visit needed"
                            placeholderTextColor="#999"
                            value={issueTitle}
                            onChangeText={setIssueTitle}
                        />

                        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Describe Issue</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.isDarkMode ? '#333' : '#F5F5F5', color: theme.colors.text }]}
                            placeholder="Please describe the issue..."
                            placeholderTextColor="#999"
                            multiline={true}
                            numberOfLines={4}
                            value={describeIssue}
                            onChangeText={setDescribeIssue}
                        />

                        <View style={styles.attachmentRow}>
                            <TouchableOpacity style={styles.attachButton}>
                                <Icon name="attach-file" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.attachButton}>
                                <Icon name="camera-alt" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <View style={styles.contactRowSmall}>
                                <Icon name="call" size={14} color="#7B61FF" style={{ marginRight: 8 }} />
                                <Text style={styles.smallContactText}>Call Us: +91 1334 567 890</Text>
                            </View>
                            <View style={styles.contactRowSmall}>
                                <Icon name="email" size={14} color="#7B61FF" style={{ marginRight: 8 }} />
                                <Text style={styles.smallContactText}>Email Us: support@doctor4home.com</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.createModalButton}
                            onPress={handleCreateTicket}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.createModalButtonText}>CREATE NEW TICKET</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
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
        paddingHorizontal: 16,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    ticketCard: {
        backgroundColor: '#F5F5F5', // Light gray background for the empty state area
        borderRadius: 15,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    ticketIcon: {
        fontSize: 40,
        marginBottom: 10,
        opacity: 0.5,
    },
    noTicketText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 5,
    },
    ticketSubText: {
        fontSize: 12,
        color: '#AAA',
        marginBottom: 20,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    contactContainer: {
        marginBottom: 10,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    contactIcon: {
        fontSize: 20,
        marginRight: 15,
        color: '#7B61FF', // Purple icon
    },
    contactLabel: {
        fontSize: 12,
        color: '#888',
    },
    contactValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    faqList: {
        marginTop: 5,
    },
    faqItem: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
        // Shadow
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    chevron: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#888',
        marginLeft: 10,
    },
    faqBody: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    faqAnswer: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
    },

    // Ticket List Styles
    ticketItem: {
        // backgroundColor: set dynamically
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    ticketHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    ticketId: {
        fontSize: 14,
        fontWeight: 'bold',
        // color: set dynamically
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    ticketTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    ticketDate: {
        fontSize: 12,
        color: '#999',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '85%',
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
        color: '#333',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 5,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dropdownSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 5,
    },
    dropdownList: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        marginBottom: 15,
        elevation: 3,
    },
    dropdownItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    dropdownItemText: {
        color: '#333',
    },
    attachmentRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    attachButton: {
        marginRight: 15,
    },
    createModalButton: {
        backgroundColor: '#7B61FF',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    createModalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    cancelButtonText: {
        color: '#999',
        fontSize: 14,
    },
    contactRowSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    smallContactText: {
        color: '#666',
        fontSize: 12
    },

    // Detail Modal Specifics
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    detailSection: {
        marginBottom: 15,
    },
    detailValueLarge: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginTop: 5,
    },
});

export default HelpCenterScreen;
