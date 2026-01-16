import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AnalyticsScreen = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.backButton} onPress={() => navigation.goBack()}>{'<'}</Text>
                <Text style={styles.headerTitle}>Analytics</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.text}>Analytics Overview Screen</Text>
                <Text style={styles.subText}>(Content to be implemented later)</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50, // Status bar padding
        backgroundColor: '#f8f8f8',
    },
    backButton: {
        fontSize: 30,
        marginRight: 20,
        color: '#000',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default AnalyticsScreen;
