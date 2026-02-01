
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

    useEffect(() => {
        const user = auth().currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = firestore()
            .collection('doctors')
            .doc('100008')
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

    // Helper for Time Frame
    const checkTimeFrame = (timestamp, frame) => {
        if (!timestamp) return false;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (frame === 'Last 30 Days') return diffDays <= 30;
        if (frame === 'Last 6 Months') return diffDays <= 180;
        // Custom Date Range would need more UI, omitting for simple loop unless requested
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
        if (searchQuery && !name.includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Time Frame
        if (filterTimeFrame && !checkTimeFrame(item.completedAt, filterTimeFrame)) {
            return false;
        }

        // Category
        if (filterCategory.length > 0) {
            // Assuming item.category or item.patientCategory exists
            const cat = item.category || item.patientCategory || '';
            if (!filterCategory.includes(cat)) return false;
        }

        // Demographics
        if (filterDemographics.length > 0) {
            const age = item.reportPrescription?.age || item.reportPrescription?.patientAge || item.patientAge;
            const cat = getAgeCategory(age);
            if (!filterDemographics.includes(cat)) return false;
        }

        return true;
    }).sort((a, b) => {
        const nameA = a.reportPrescription?.patientName || '';
        const nameB = b.reportPrescription?.patientName || '';

        if (sortBy === 'Last recently Visited') {
            const timeA = a.completedAt?.seconds || 0;
            const timeB = b.completedAt?.seconds || 0;
            return timeB - timeA;
        } else if (sortBy === 'Alphabetical') {
            // Logic: Compare names. If names are same, what next? User said:
            // "abhishek aher and abhishek bakade then abhishek aher first"
            // This is just standard string comparison.
            return nameA.localeCompare(nameB);
        } else if (sortBy === 'Frequency') {
            const freq = getPatientFrequency();
            const countA = freq[nameA] || 0;
            const countB = freq[nameB] || 0;
            if (countA !== countB) return countB - countA; // Higher freq first
            return nameA.localeCompare(nameB); // Fallback to name
        }
        return 0;
    });

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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Medical Records</Text>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: theme.colors.card }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Icon name="tune" size={20} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
                    <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search Patient Here..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.searchInput, { color: theme.colors.text }]}
                    />
                </View>
            </View>

            <FlatList
                data={filteredRecords}
                renderItem={renderRecordItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.colors.textSecondary }}>No medical records found.</Text>
                    </View>
                }
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
                                onPress={() => setSortBy(option)}
                            >
                                <View style={[
                                    styles.radioCircle,
                                    { borderColor: theme.colors.primary },
                                    sortBy === option && { borderColor: theme.colors.primary, backgroundColor: 'white' }
                                ]}>
                                    {sortBy === option && <View style={[styles.selectedRb, { backgroundColor: theme.colors.primary }]} />}
                                </View>
                                <Text style={[styles.optionText, { color: theme.colors.text }]}>{option}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                        {/* Filter By Time Frame */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Time Frame</Text>
                        {/* Radio buttons for Time Frame since date ranges usually mutually exclusive or single select */}
                        {['Last 30 Days', 'Last 6 Months', 'Custom Date Range'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.optionRow}
                                onPress={() => setFilterTimeFrame(filterTimeFrame === option ? null : option)}
                            >
                                <View style={[
                                    styles.radioCircle,
                                    { borderColor: theme.colors.primary },
                                    filterTimeFrame === option && { borderColor: theme.colors.primary, backgroundColor: 'white' }
                                ]}>
                                    {filterTimeFrame === option && <View style={[styles.selectedRb, { backgroundColor: theme.colors.primary }]} />}
                                </View>
                                <Text style={[styles.optionText, { color: theme.colors.text }]}>{option}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                        {/* Filter By Category */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Patient Category</Text>
                        {['Chronic', 'Acute'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={styles.optionRow}
                                onPress={() => toggleFilter(filterCategory, setFilterCategory, cat)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: theme.colors.primary },
                                    filterCategory.includes(cat) && { backgroundColor: theme.colors.primary }
                                ]}>
                                    {filterCategory.includes(cat) && <Icon name="check" size={14} color="white" />}
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
                                onPress={() => toggleFilter(filterDemographics, setFilterDemographics, demo)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: theme.colors.primary },
                                    filterDemographics.includes(demo) && { backgroundColor: theme.colors.primary }
                                ]}>
                                    {filterDemographics.includes(demo) && <Icon name="check" size={14} color="white" />}
                                </View>
                                <Text style={[styles.optionText, { color: theme.colors.text }]}>{demo}</Text>
                            </TouchableOpacity>
                        ))}

                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.footerButton, { borderColor: theme.colors.border, borderWidth: 1 }]}
                            onPress={() => {
                                setSortBy('Last recently Visited');
                                setFilterTimeFrame(null);
                                setFilterCategory([]);
                                setFilterDemographics([]);
                            }}
                        >
                            <Text style={{ color: theme.colors.text }}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => setModalVisible(false)}
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
});

export default MedicalRecordsScreen;
