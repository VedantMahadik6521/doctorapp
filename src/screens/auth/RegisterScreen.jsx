import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleRegister = async () => {
    if (!name || !specialization || !location) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!accepted) {
      Alert.alert('Error', 'Please accept Terms & Conditions');
      return;
    }

    try {
      setLoading(true);
      const user = auth().currentUser;
      if (!user) return;

      await firestore().collection('doctors').doc(user.uid).set({
        name,
        specialization,
        location,
        phone: user.phoneNumber,
        profileCompleted: false,
        verified: false,
        isOnline: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 🔥 SESSION CONTROL
      navigation.replace('EntryGate');
    } catch {
      Alert.alert('Error', 'Failed to create profile');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#4B2E83', '#6A5ACD']} style={styles.header}>
        <Text style={styles.headerTitle}>Sign up to</Text>
        <Text style={styles.headerTitle}>your Account</Text>
        <Text style={styles.headerSubtitle}>
          Enter your details to continue
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Specialization</Text>
        <TextInput style={styles.input} value={specialization} onChangeText={setSpecialization} />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} />

        <View style={styles.termsRow}>
          <TouchableOpacity onPress={() => setAccepted(!accepted)}>
            <View style={[styles.checkbox, accepted && styles.checked]} />
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I Agree to the{' '}
            <Text
              style={{ color: '#007BFF', fontWeight: 'bold' }}
              onPress={() => setShowTermsModal(true)}
            >
              Terms & Conditions
            </Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Terms Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>1. Introduction</Text>
              <Text style={styles.paragraph}>
                Welcome to DoctorApp. By using our application, you agree to comply with and be bound by the following terms and conditions of use. Please review these terms carefully.
              </Text>

              <Text style={styles.sectionTitle}>2. Acceptance of Agreement</Text>
              <Text style={styles.paragraph}>
                You agree to the terms and conditions outlined in this Agreement with respect to our application. This Agreement constitutes the entire and only agreement between us and you, and supersedes all prior or contemporaneous agreements.
              </Text>

              <Text style={styles.sectionTitle}>3. Use of Services</Text>
              <Text style={styles.paragraph}>
                Our services are provided for healthcare management purposes. You agree not to use the app for any unlawful purpose or in any way that interrupts, damages, or impairs the service.
              </Text>

              <Text style={styles.sectionTitle}>4. Limitations of Liability</Text>
              <Text style={styles.paragraph}>
                We shall not be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use our application.
              </Text>
              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  header: {
    height: 220,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E0E0E0',
    marginTop: 8,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -60,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  termsRow: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#4B2E83',
  },
  termsText: {
    fontSize: 12,
    color: '#777',
    flex: 1,
  },
  button: {
    backgroundColor: '#000',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'justify',
  },
  closeButton: {
    backgroundColor: '#4B2E83',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
