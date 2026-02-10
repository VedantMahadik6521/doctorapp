
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
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DatePicker from 'react-native-date-picker';

const MedicalRecordsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [modalVisible, setModalVisible] = useState(false);
    const [sortBy, setSortBy] = useState('Last recently Visited');
    const [filterTimeFrame, setFilterTimeFrame] = useState(null); // 'Last 30 Days', 'Last 6 Months', 'Custom'
    const [filterCategory, setFilterCategory] = useState([]);
    const [filterDemographics, setFilterDemographics] = useState([]);

    // Temporary Filter States (for Modal)
    const [tempSortBy, setTempSortBy] = useState('Last recently Visited');
    const [tempFilterTimeFrame, setTempFilterTimeFrame] = useState(null);
    const [tempFilterCategory, setTempFilterCategory] = useState([]);
    const [tempFilterDemographics, setTempFilterDemographics] = useState([]);
    const [tempCustomStartDate, setTempCustomStartDate] = useState('');
    const [tempCustomEndDate, setTempCustomEndDate] = useState('');

    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

    const openFilterModal = () => {
        setTempSortBy(sortBy);
        setTempFilterTimeFrame(filterTimeFrame);
        setTempFilterCategory([...filterCategory]);
        setTempFilterDemographics([...filterDemographics]);
        setTempCustomStartDate(customStartDate);
        setTempCustomEndDate(customEndDate);
        setModalVisible(true);
    };

    const applyFilters = () => {
        setSortBy(tempSortBy);
        setFilterTimeFrame(tempFilterTimeFrame);
        setFilterCategory(tempFilterCategory);
        setFilterDemographics(tempFilterDemographics);
        setCustomStartDate(tempCustomStartDate);
        setCustomEndDate(tempCustomEndDate);
        setModalVisible(false);
    };

    // Grouping State
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const user = auth().currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = firestore()
            .collection('doctors')
            .doc(user.uid)
            .collection('records')
            .orderBy('completedAt', 'desc')
            .onSnapshot(
                snapshot => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setRecords(data);
                    setLoading(false);
                },
                error => {
                    console.error('Records fetch error:', error);
                    setLoading(false);
                }
            );

        return unsubscribe;
    }, []);

    // Helper for Age Category
    const getAgeCategory = (age) => {
        if (!age) return null;
        const ageNum = parseInt(age);
        if (ageNum < 18) return 'Pediatric';
        if (ageNum >= 18 && ageNum < 60) return 'Adult';
        if (ageNum >= 60) return 'Geriatric';
        return null;
    };

    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Helper for Time Frame
    const checkTimeFrame = (timestamp, frame) => {
        if (!timestamp) return false;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();

        if (frame === 'Last 30 Days') {
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
        }
        if (frame === 'Last 6 Months') {
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 180;
        }
        if (frame === 'Custom Date Range') {
            if (!customStartDate && !customEndDate) return true;

            if (!customStartDate && !customEndDate) return true;

            let start = new Date('1900-01-01');
            let end = new Date();

            if (customStartDate) {
                const [day, month, year] = customStartDate.split('-');
                start = new Date(`${year}-${month}-${day}`);
            }

            if (customEndDate) {
                const [day, month, year] = customEndDate.split('-');
                end = new Date(`${year}-${month}-${day}`);
            }

            // Set end of day for the end date inclusion
            end.setHours(23, 59, 59, 999);

            return date >= start && date <= end;
        }
        return true;
    };

    // Frequency Map for Sorting
    const getPatientFrequency = () => {
        const freq = {};
        records.forEach(r => {
            const name = r.reportPrescription?.patientName || 'Unknown';
            freq[name] = (freq[name] || 0) + 1;
        });
        return freq;
    };

    const toggleFilter = (state, setState, value) => {
        if (state.includes(value)) {
            setState(state.filter(item => item !== value));
        } else {
            setState([...state, value]);
        }
    };

    const filteredRecords = records.filter(item => {
        // Search
        const name = item.reportPrescription?.patientName?.toLowerCase() || '';
        const issue = item.healthIssue?.toLowerCase() || '';
        const searchLower = searchQuery.toLowerCase();

        if (searchQuery && !name.includes(searchLower) && !issue.includes(searchLower)) {
            return false;
        }

        // Time Frame
        if (filterTimeFrame && !checkTimeFrame(item.completedAt, filterTimeFrame)) {
            return false;
        }

        // Category
        if (filterCategory.length > 0) {
            const cat = item.reportPrescription?.patientType || '';
            if (!filterCategory.includes(cat)) return false;
        }

        // Demographics
        if (filterDemographics.length > 0) {
            const age = item.reportPrescription?.age || item.reportPrescription?.patientAge || item.patientAge;
            const cat = getAgeCategory(age);
            if (!filterDemographics.includes(cat)) return false;
        }

        return true;
    }).sort((a, b) => { // Keep base sort for individual records in the drill-down
        const nameA = a.reportPrescription?.patientName || '';
        const nameB = b.reportPrescription?.patientName || '';

        if (sortBy === 'Last recently Visited') {
            const timeA = a.completedAt?.seconds || 0;
            const timeB = b.completedAt?.seconds || 0;
            return timeB - timeA;
        } else if (sortBy === 'Alphabetical') {
            return nameA.localeCompare(nameB);
        } else if (sortBy === 'Frequency') {
            // Frequency sort might be weird for individual records but keeping consistency
            return 0; // Handled better at group level
        }
        return 0;
    });

    // Grouping Logic
    const groupedPatientRecords = React.useMemo(() => {
        const groups = {};
        filteredRecords.forEach(record => {
            // Fallback to name if ID is somehow missing to ensure grouping
            const pId = record.patientId || record.reportPrescription?.patientName || 'unknown';
            if (!groups[pId]) {
                groups[pId] = {
                    patientId: pId,
                    patientName: record.reportPrescription?.patientName || 'Unknown Patient',
                    patientImage: record.patientImage,
                    records: [],
                    latestDate: 0
                };
            }
            groups[pId].records.push(record);
            const recTime = record.completedAt?.seconds || 0;
            if (recTime > groups[pId].latestDate) {
                groups[pId].latestDate = recTime;
            }
        });

        // Convert to array and sort groups based on sortBy
        return Object.values(groups).sort((a, b) => {
            if (sortBy === 'Last recently Visited') {
                return b.latestDate - a.latestDate;
            } else if (sortBy === 'Alphabetical') {
                return a.patientName.localeCompare(b.patientName);
            } else if (sortBy === 'Frequency') {
                return b.records.length - a.records.length;
            }
            return 0;
        });
    }, [filteredRecords, sortBy]);

    const handleBack = () => {
        if (selectedPatient) {
            setSelectedPatient(null);
        } else {
            navigation.goBack();
        }
    };

    const renderPatientGroupItem = ({ item }) => {
        const { patientName, patientImage, records } = item;
        const count = records.length;
        const latestRecord = records[0]; // Since filteredRecords is sorted by date desc generally? 
        // Actually filteredRecords sort depends on state. 
        // But we computed latestDate for the group sort.
        // Let's just take the first one or find the one with latestDate if needed for display.
        // But for "Health Issue", maybe show the latest one.

        // Sorting records within group for display consistency (Latest first)
        const sortedRecords = [...records].sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
        const latestIssue = sortedRecords[0]?.healthIssue || 'General Check-up';

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.colors.card }]}
                onPress={() => setSelectedPatient({ ...item, records: sortedRecords })}
            >
                <View style={styles.cardHeader}>
                    <Image
                        source={patientImage ? { uri: patientImage } : require('../../assets/images/avatar.png')}
                        style={styles.avatar}
                        defaultSource={require('../../assets/images/avatar.png')}
                    />
                    <View style={styles.cardContent}>
                        <Text style={[styles.name, { color: theme.colors.text }]}>
                            {patientName}
                        </Text>
                        <Text style={[styles.healthIssue, { color: theme.colors.textSecondary }]}>
                            Latest: <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{latestIssue}</Text>
                        </Text>
                        <Text style={[styles.subText, { color: theme.colors.primary, marginTop: 4 }]}>
                            {count} Record{count !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <View style={{ justifyContent: 'center' }}>
                        <Icon name="chevron-right" size={30} color={theme.colors.textSecondary} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderRecordItem = ({ item }) => {
        const { reportPrescription, healthIssue, patientImage } = item;

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <View style={styles.cardHeader}>
                    <Image
                        source={patientImage ? { uri: patientImage } : require('../../assets/images/avatar.png')}
                        style={styles.avatar}
                        defaultSource={require('../../assets/images/avatar.png')}
                    />
                    <View style={styles.cardContent}>
                        <Text style={[styles.name, { color: theme.colors.text }]}>
                            {reportPrescription?.patientName || 'Unknown Patient'}
                        </Text>
                        <Text style={[styles.healthIssue, { color: theme.colors.textSecondary }]}>
                            <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>Health Issue: </Text>
                            {healthIssue || 'General Check-up'}
                        </Text>
                        {reportPrescription?.diagnosis && (
                            <Text style={[styles.subText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                {reportPrescription.diagnosis}
                            </Text>
                        )}
                        {/* Debugging visual for filters if needed, e.g. Age */}
                        {/* <Text style={{fontSize: 10, color: 'gray'}}>Age: {reportPrescription?.patientAge}</Text> */}
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={[styles.detailsButton, { backgroundColor: '#9370DB' }]}
                        onPress={() => {
                            navigation.navigate('PatientDetails', { record: item });
                        }}
                    >
                        <Text style={styles.detailsButtonText}>More Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Medical Records</Text>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: theme.colors.card }]}
                    onPress={openFilterModal}
                >
                    <Icon name="tune" size={20} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
                    <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search Patient or Health Issue..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.searchInput, { color: theme.colors.text }]}
                    />
                </View>
            </View>

            {!selectedPatient ? (
                <FlatList
                    data={groupedPatientRecords}
                    renderItem={renderPatientGroupItem}
                    keyExtractor={item => item.patientId}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: theme.colors.textSecondary }}>No medical records found.</Text>
                        </View>
                    }
                />
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.subHeader}>
                        <Text style={[styles.subHeaderTitle, { color: theme.colors.text }]}>
                            Records for {selectedPatient.patientName}
                        </Text>
                    </View>
                    <FlatList
                        data={selectedPatient.records}
                        renderItem={renderRecordItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={{ color: theme.colors.textSecondary }}>No records for this patient.</Text>
                            </View>
                        }
                    />
                </View>
            )}

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
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filter Records</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Icon name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Sort By */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sort By</Text>
                        {['Last recently Visited', 'Alphabetical', 'Frequency'].map((option) => (
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

                        {/* Filter By Time Frame */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Time Frame</Text>
                        {/* Radio buttons for Time Frame since date ranges usually mutually exclusive or single select */}
                        {['Last 30 Days', 'Last 6 Months', 'Custom Date Range'].map((option) => (
                            <View key={option}>
                                <TouchableOpacity
                                    style={styles.optionRow}
                                    onPress={() => setTempFilterTimeFrame(tempFilterTimeFrame === option ? null : option)}
                                >
                                    <View style={[
                                        styles.radioCircle,
                                        { borderColor: theme.colors.primary },
                                        tempFilterTimeFrame === option && { borderColor: theme.colors.primary, backgroundColor: 'white' }
                                    ]}>
                                        {tempFilterTimeFrame === option && <View style={[styles.selectedRb, { backgroundColor: theme.colors.primary }]} />}
                                    </View>
                                    <Text style={[styles.optionText, { color: theme.colors.text }]}>{option}</Text>
                                </TouchableOpacity>

                                {/* Custom Date Inputs */}
                                {option === 'Custom Date Range' && tempFilterTimeFrame === 'Custom Date Range' && (
                                    <View style={styles.dateInputContainer}>
                                        <View style={styles.dateInputWrapper}>
                                            <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>From (DD-MM-YYYY)</Text>
                                            <TouchableOpacity
                                                style={[styles.dateInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, justifyContent: 'center' }]}
                                                onPress={() => setOpenStartDatePicker(true)}
                                            >
                                                <Text style={{ color: tempCustomStartDate ? theme.colors.text : theme.colors.textSecondary }}>
                                                    {tempCustomStartDate || 'DD-MM-YYYY'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.dateInputWrapper}>
                                            <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>To (DD-MM-YYYY)</Text>
                                            <TouchableOpacity
                                                style={[styles.dateInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, justifyContent: 'center' }]}
                                                onPress={() => setOpenEndDatePicker(true)}
                                            >
                                                <Text style={{ color: tempCustomEndDate ? theme.colors.text : theme.colors.textSecondary }}>
                                                    {tempCustomEndDate || 'DD-MM-YYYY'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <DatePicker
                                            modal
                                            open={openStartDatePicker}
                                            date={new Date()} // Default to today since we store string now
                                            mode="date"
                                            onConfirm={(date) => {
                                                setOpenStartDatePicker(false);
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const year = date.getFullYear();
                                                setTempCustomStartDate(`${day}-${month}-${year}`);
                                            }}
                                            onCancel={() => {
                                                setOpenStartDatePicker(false);
                                            }}
                                        />
                                        <DatePicker
                                            modal
                                            open={openEndDatePicker}
                                            date={new Date()}
                                            mode="date"
                                            onConfirm={(date) => {
                                                setOpenEndDatePicker(false);
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const year = date.getFullYear();
                                                setTempCustomEndDate(`${day}-${month}-${year}`);
                                            }}
                                            onCancel={() => {
                                                setOpenEndDatePicker(false);
                                            }}
                                        />
                                    </View>
                                )}
                            </View>
                        ))}

                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                        {/* Filter By Category */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Patient Category</Text>
                        {['Chronic', 'Acute'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={styles.optionRow}
                                onPress={() => toggleFilter(tempFilterCategory, setTempFilterCategory, cat)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: theme.colors.primary },
                                    tempFilterCategory.includes(cat) && { backgroundColor: theme.colors.primary }
                                ]}>
                                    {tempFilterCategory.includes(cat) && <Icon name="check" size={14} color="white" />}
                                </View>
                                <Text style={[styles.optionText, { color: theme.colors.text }]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                        {/* Filter By Demographics */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Demographics</Text>
                        {['Pediatric', 'Adult', 'Geriatric'].map((demo) => (
                            <TouchableOpacity
                                key={demo}
                                style={styles.optionRow}
                                onPress={() => toggleFilter(tempFilterDemographics, setTempFilterDemographics, demo)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: theme.colors.primary },
                                    tempFilterDemographics.includes(demo) && { backgroundColor: theme.colors.primary }
                                ]}>
                                    {tempFilterDemographics.includes(demo) && <Icon name="check" size={14} color="white" />}
                                </View>
                                <Text style={[styles.optionText, { color: theme.colors.text }]}>{demo}</Text>
                            </TouchableOpacity>
                        ))}

                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.footerButton, { borderColor: theme.colors.border, borderWidth: 1 }]}
                            onPress={() => {
                                setTempSortBy('Last recently Visited');
                                setTempFilterTimeFrame(null);
                                setTempCustomStartDate('');
                                setTempCustomEndDate('');
                                setTempFilterCategory([]);
                                setTempFilterDemographics([]);
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
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    filterButton: {
        padding: 10,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginVertical: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: '#ccc',
    },
    cardContent: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    healthIssue: {
        fontSize: 13,
        marginBottom: 2,
    },
    subText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    cardFooter: {
        alignItems: 'flex-end',
        marginTop: 10,
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
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
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
        paddingVertical: 8,
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
    subHeader: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10,
    },
    subHeaderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 32, // Indent under radio button
        marginTop: 5,
        marginBottom: 10,
    },
    dateInputWrapper: {
        flex: 1,
        marginRight: 10,
    },
    dateLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    dateInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
    }
});

export default MedicalRecordsScreen;
