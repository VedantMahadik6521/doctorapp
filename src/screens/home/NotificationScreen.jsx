import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const NOTIFICATIONS = [
    { id: '1', title: 'New Request', message: 'You have a new consultation request.', time: '2m ago' },
    { id: '2', title: 'System Update', message: 'The app has been updated to v2.0.', time: '1h ago' },
];

const NotificationScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.backButton, { color: theme.colors.text }]} onPress={() => navigation.goBack()}>{'<'}</Text>
                <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
            </View>
            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
                            <Text style={{ color: theme.colors.textSecondary }}>{item.message}</Text>
                        </View>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.time}</Text>
                    </View>
                )}
                contentContainerStyle={{ padding: 20 }}
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
