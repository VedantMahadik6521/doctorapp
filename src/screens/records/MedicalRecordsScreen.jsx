
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
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MedicalRecordsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth().currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = firestore()
            .collection('doctors')
            .doc('100008') // Using hardcoded ID to match MyRequestScreen
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

    const filteredRecords = records.filter(item =>
        item.reportPrescription?.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        {/* Subtitle if needed, e.g. Symptoms or Date */}
                        {reportPrescription?.diagnosis && (
                            <Text style={[styles.subText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                {reportPrescription.diagnosis}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    {/* Placeholder for "More Details" if we have a details screen for historical records */}
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
                <TouchableOpacity style={styles.filterButton}>
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
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 2,
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
        backgroundColor: '#ccc', // Placeholder color
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
    }
});

export default MedicalRecordsScreen;
