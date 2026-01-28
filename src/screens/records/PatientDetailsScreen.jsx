import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const PatientDetailsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { record } = route.params || {};

    const [activeTab, setActiveTab] = useState('Lab Report');

    const renderHeader = () => {
        const { reportPrescription, healthIssue, patientImage } = record || {};
        return (
            <View style={styles.headerContainer}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.screenTitle, { color: theme.colors.text }]}>Patient Details</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon name="favorite-border" size={24} color={theme.colors.text} style={{ marginRight: 15 }} />
                        <Icon name="share" size={24} color={theme.colors.text} />
                    </View>
                </View>

                <View style={styles.profileSection}>
                    <Image
                        source={patientImage ? { uri: patientImage } : require('../../assets/images/avatar.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={[styles.patientName, { color: theme.colors.text }]}>
                            {reportPrescription?.patientName || 'Unknown Name'}
                        </Text>
                        <Text style={[styles.patientDetail, { color: theme.colors.textSecondary }]}>
                            Location: {reportPrescription?.location || 'N/A'}
                        </Text>
                        <Text style={[styles.patientDetail, { color: theme.colors.textSecondary }]}>
                            Age: {reportPrescription?.age || 'N/A'}
                        </Text>
                        <Text style={[styles.patientDetail, { color: theme.colors.textSecondary }]}>
                            Physical Visit (Home Consultation)
                        </Text>
                        <Text style={[styles.patientDetail, { color: theme.colors.textSecondary, marginTop: 5 }]}>
                            <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>Health Issue: </Text>
                            {healthIssue || 'General Check-up'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderTabs = () => {
        return (
            <View style={styles.tabContainer}>
                {['Lab Report', 'Prescription', 'Review'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabButton,
                            activeTab === tab && { backgroundColor: theme.colors.primary },
                            activeTab !== tab && { backgroundColor: theme.colors.card } // lighter bg for inactive
                        ]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab ? { color: '#fff' } : { color: theme.colors.text },
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderLabReports = () => {
        return (
            <View style={styles.contentSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Lab Reports</Text>
                <View style={[styles.card, { backgroundColor: theme.colors.card, alignItems: 'center', padding: 40 }]}>
                    <Text style={{ color: theme.colors.textSecondary, marginBottom: 20 }}>No Lab Reports</Text>
                    {/* Placeholder for when we have files provided in the data struct later
                     <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        {[1,2,3,4,5].map(i => (
                             <Icon key={i} name="file-text" size={40} color={theme.colors.text} style={{margin: 10}} />
                        ))}
                     </View>
                     */}
                </View>
            </View>
        );
    };

    const renderPrescription = () => {
        const { reportPrescription } = record || {};
        return (
            <View style={styles.contentSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Prescription</Text>

                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name:</Text>
                    <View style={[styles.inputDisplay, { backgroundColor: theme.colors.background }]}>
                        <Text style={{ color: theme.colors.text }}>{reportPrescription?.patientName}</Text>
                    </View>

                    <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 15 }]}>Consultation Date:</Text>
                    <View style={[styles.inputDisplay, { backgroundColor: theme.colors.background }]}>
                        <Text style={{ color: theme.colors.text }}>
                            {record?.completedAt?.toDate ? record.completedAt.toDate().toDateString() : 'N/A'}
                        </Text>
                    </View>

                    <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 15 }]}>Medicines:</Text>
                    {/* Simple Table Representation */}
                    <View style={[styles.tableContainer, { borderColor: theme.colors.border }]}>
                        <View style={[styles.tableHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.tableHeaderText, { color: theme.colors.text, flex: 2 }]}>Medicine</Text>
                            <Text style={[styles.tableHeaderText, { color: theme.colors.text, flex: 1 }]}>Duration</Text>
                        </View>
                        {reportPrescription?.medicines?.map((med, index) => (
                            <View key={index} style={[styles.tableRow, { borderBottomColor: theme.colors.border }]}>
                                <View style={{ flex: 2 }}>
                                    <Text style={[styles.tableCell, { color: theme.colors.text, fontWeight: 'bold' }]}>{med.name}</Text>
                                    <Text style={[styles.tableCell, { color: theme.colors.textSecondary, fontSize: 12 }]}>
                                        {`B: ${med.dosage?.breakfast || '-'}, L: ${med.dosage?.lunch || '-'}, D: ${med.dosage?.dinner || '-'}`}
                                    </Text>
                                </View>
                                {/* Duration is not present in data, removed or placeholder */}
                                <Text style={[styles.tableCell, { color: theme.colors.text, flex: 1 }]}>-</Text>
                            </View>
                        )) || <Text style={{ padding: 10, color: theme.colors.textSecondary }}>No medicines listed</Text>}
                    </View>

                    <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 15 }]}>Instructions:</Text>
                    <View style={[styles.inputDisplay, { backgroundColor: theme.colors.background, minHeight: 80 }]}>
                        {
                            (typeof reportPrescription?.instructions === 'object' && reportPrescription?.instructions !== null) ? (
                                <View>
                                    <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>Breakfast:</Text>
                                    <Text style={{ color: theme.colors.text, marginBottom: 5 }}>{reportPrescription.instructions.breakfast || 'N/A'}</Text>

                                    <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>Lunch:</Text>
                                    <Text style={{ color: theme.colors.text, marginBottom: 5 }}>{reportPrescription.instructions.lunch || 'N/A'}</Text>

                                    <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>Dinner:</Text>
                                    <Text style={{ color: theme.colors.text }}>{reportPrescription.instructions.dinner || 'N/A'}</Text>
                                </View>
                            ) : (
                                <Text style={{ color: theme.colors.text }}>
                                    {reportPrescription?.instructions || 'Avoid Fast Food\nKeep Body Hydrated\nTake Rest'}
                                </Text>
                            )
                        }
                    </View>
                </View>
            </View>
        );
    };

    const renderReview = () => {
        return (
            <View style={styles.contentSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Review</Text>
                <View style={[styles.reviewCard, { backgroundColor: '#6200EE' }]}>
                    <View style={styles.reviewHeader}>
                        <Text style={styles.reviewTitle}>Cardiologist Visit</Text>
                    </View>
                    <Text style={styles.reviewText}>
                        "Excellent care! Dr shetty was Understanding And Helpful."
                    </Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(i => <Icon key={i} name="star" size={16} color="#FFD700" style={{ marginHorizontal: 2 }} />)}
                    </View>
                    <Text style={styles.reviewerName}>- {record?.reportPrescription?.patientName || 'Patient'}</Text>
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderTabs()}
                {activeTab === 'Lab Report' && renderLabReports()}
                {activeTab === 'Prescription' && renderPrescription()}
                {activeTab === 'Review' && renderReview()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    headerContainer: {
        padding: 20,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    screenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    patientDetail: {
        fontSize: 13,
        marginBottom: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        minWidth: 90,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    contentSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    card: {
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    inputDisplay: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 5,
    },
    tableContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 5,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        backgroundColor: '#f0f0f050',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
    },
    tableHeaderText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    tableCell: {
        fontSize: 14,
    },
    reviewCard: {
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
    },
    reviewTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reviewText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 15,
        lineHeight: 20,
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    reviewerName: {
        color: '#E0E0E0',
        fontSize: 12,
        alignSelf: 'flex-end',
    }
});

export default PatientDetailsScreen;
