import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const PaymentMethodScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const { amount, reason, upiId } = route.params || {};

  const handlePay = async () => {
    if (!upiId || !amount) {
      Alert.alert('Error', 'Invalid payment details');
      return;
    }

    const encodedReason = encodeURIComponent(reason || 'Payment');
    const encodedName = encodeURIComponent('Doctor4Home');

    const upiUrl =
  `upi://pay` +
  `?pa=${upiId}` +
  `&tn=${encodedReason}` +
  `&am=${amount}` +
  `&cu=INR`;


    try {
      await Linking.openURL(upiUrl);
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Payment Failed',
        'No UPI app found. Please install Google Pay / PhonePe / Paytm.'
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Payment Info */}
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Refund Reason
        </Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {reason}
        </Text>

        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 20 }]}>
          Amount
        </Text>
        <Text style={[styles.amount, { color: theme.colors.primary }]}>
          ₹ {amount}
        </Text>

        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 20 }]}>
          UPI ID
        </Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {upiId}
        </Text>
      </View>

      {/* Pay Button */}
      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={styles.payButtonText}>Proceed to Pay</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PaymentMethodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
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
    fontSize: 13,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  payButton: {
    backgroundColor: 'black',
    margin: 20,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
