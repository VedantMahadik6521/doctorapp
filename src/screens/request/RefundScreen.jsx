import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const RefundScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { amount = '0', upiId: passedUpiId } = route.params || {};

    const [reason, setReason] = useState('');
    const [upiId, setUpiId] = useState(passedUpiId || '');

    const handlePay = () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please enter a reason for the refund.');
            return;
        }
        if (!upiId.trim()) {
            Alert.alert('Error', 'Please enter a UPI ID.');
            return;
        }

        navigation.navigate('PaymentMethod', {
            amount,
            reason,
            upiId
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={[styles.backIcon, { color: theme.colors.text }]}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Refund Page</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Reason Input */}
                <Text style={[styles.label, { color: theme.colors.text }]}>Write a reason here</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, height: 100, textAlignVertical: 'top' }]}
                        placeholder="Enter reason..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={reason}
                        onChangeText={setReason}
                        multiline
                    />
                </View>

                {/* Refundable Amount */}
                <View style={[styles.amountContainer, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.label, { color: theme.colors.text, marginBottom: 0 }]}>Refundable Amount</Text>
                    <Text style={[styles.amountText, { color: theme.colors.text }]}>
                        {amount}/-
                    </Text>
                </View>

                {/* UPI ID Input or Display */}
                <Text style={[styles.label, { color: theme.colors.text }]}>{passedUpiId ? 'Refund To UPI ID' : 'Add UPI ID'}</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
                    {passedUpiId ? (
                        <Text style={{ color: theme.colors.text, fontSize: 16, paddingVertical: 12 }}>{passedUpiId}</Text>
                    ) : (
                        <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder="Enter UPI ID"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={upiId}
                            onChangeText={setUpiId}
                        />
                    )}
                </View>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Pay Button */}
                <TouchableOpacity style={styles.payButton} onPress={handlePay}>
                    <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
            </View>
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
        paddingTop: Platform.OS === 'android' ? 40 : 15,
        paddingBottom: 15,
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
        flex: 1,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
        marginTop: 10,
        fontWeight: '500',
    },
    inputContainer: {
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10, // Default padding
        marginBottom: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    input: {
        fontSize: 16,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    payButton: {
        backgroundColor: 'black',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    payButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RefundScreen;
