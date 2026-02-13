import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { formatDistanceToNow } from 'date-fns'; // You might need to install date-fns or use a simple formatter

const NotificationScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [notifications, setNotifications] = React.useState([]);

    React.useEffect(() => {
        const currentUser = auth().currentUser;
        if (!currentUser) return;

        const unsubscribe = firestore()
            .collection('doctors')
            .doc(currentUser.uid)
            .collection('notifications')
            .orderBy('timestamp', 'desc')
            .onSnapshot(querySnapshot => {
                const fetchedNotifications = [];
                querySnapshot.forEach(documentSnapshot => {
                    fetchedNotifications.push({
                        ...documentSnapshot.data(),
                        id: documentSnapshot.id,
                    });
                });
                setNotifications(fetchedNotifications);
            }, error => {
                console.error("Error fetching notifications:", error);
            });

        return () => unsubscribe();
    }, []);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        // Simple fallback if date-fns not available or for simplicity
        const date = timestamp.toDate();
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backButton, { color: theme.colors.text }]}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
            </View>
            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
                            <Text style={{ color: theme.colors.textSecondary }}>{item.message}</Text>
                        </View>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                            {formatTime(item.timestamp)}
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.textSecondary }}>
                        No notifications yet.
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
    backButton: { fontSize: 30, marginRight: 20, fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold' },
    card: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 }
});

export default NotificationScreen;
