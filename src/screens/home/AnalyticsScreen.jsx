import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using MaterialIcons
import { useTheme } from '../../context/ThemeContext'; // Assuming you have a theme context

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme(); // Use theme if available, otherwise fallback to hardcoded
    const [stats, setStats] = useState({
        pending: 0,
        completed: 0,
        today: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = auth().currentUser;
                if (!user) {
                    setLoading(false);
                    return;
                }

                // 1. Pending Requests (from 'doctors/{uid}/patients' subcollection)
                const pendingSnapshot = await firestore()
                    .collection('doctors')
                    .doc('100008') // Using hardcoded ID to match MyRequestScreen
                    .collection('patients')
                    .get();
                const pendingCount = pendingSnapshot.size;

                // 2. Completed Visits (from 'doctors/{uid}/records' subcollection)
                const completedSnapshot = await firestore()
                    .collection('doctors')
                    .doc('100008') // Using hardcoded ID to match MyRequestScreen
                    .collection('records')
                    .get();

                const completedDocs = completedSnapshot.docs;
                const completedCount = completedDocs.length;

                // 3. Today's Visits (Filter client-side to avoid Index requirement)
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                // Filter the ALREADY FETCHED completedDocs
                const todayCount = completedDocs.filter(doc => {
                    const data = doc.data();
                    if (!data.completedAt) return false;
                    // Handle Firestore Timestamp or Date string
                    const completedDate = data.completedAt.toDate ? data.completedAt.toDate() : new Date(data.completedAt);
                    return completedDate >= startOfDay;
                }).length;

                setStats({
                    pending: pendingCount,
                    completed: completedCount,
                    today: todayCount
                });

            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const renderCard = (title, count, iconName, timeLabel = 'This Month') => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Icon name={iconName} size={24} color="#5B4DBC" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={styles.cardRight}>
                <View style={styles.timeLabelContainer}>
                    <Text style={styles.timeLabel}>{timeLabel}</Text>
                    <Icon name="keyboard-arrow-down" size={12} color="#666" style={{ marginLeft: 4 }} />
                </View>
                <Text style={styles.cardCount}>{count}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#5B4DBC" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analytics</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderCard('Pending Requests', stats.pending, 'description', 'Current')}
                {renderCard('Completed Visits', stats.completed, 'check-circle', 'All Time')}
                {renderCard('Today\'s Visits', stats.today, 'calendar-today', 'Today')}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Light grey background like in screenshot
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ECE9FF', // Light purple bg
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    timeLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    timeLabel: {
        fontSize: 12,
        color: '#666',
    },
    cardCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default AnalyticsScreen;
