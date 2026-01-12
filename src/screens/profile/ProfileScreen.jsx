import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const ProfileScreen = () => {
  /* ---------------- STATES ---------------- */

  const [isEditing, setIsEditing] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [signature, setSignature] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [form, setForm] = useState({
    regNo: '',
    city: '',
    qualification: '',
    speciality: '',
    subSpeciality: '',
    experience: '',
    charge5: '',
    charge10: '',
  });

  /* ---------------- HELPERS ---------------- */

  const onChange = (key, value) => {
    if (!isEditing) return;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = setter => {
    if (!isEditing) return;
    launchImageLibrary({ mediaType: 'photo' }, res => {
      if (!res.didCancel && res.assets?.length) {
        setter(res.assets[0]);
      }
    });
  };

  const pickDocuments = () => {
    if (!isEditing) return;
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 }, res => {
      if (!res.didCancel && res.assets?.length) {
        setDocuments(res.assets);
      }
    });
  };

  const uploadFile = async (uri, path) => {
    const ref = storage().ref(path);
    await ref.putFile(uri);
    return await ref.getDownloadURL();
  };

  /* ---------------- VALIDATION ---------------- */

  const isFormComplete = useMemo(() => {
    return (
      profileImage &&
      signature &&
      documents.length > 0 &&
      Object.values(form).every(v => v.trim() !== '')
    );
  }, [profileImage, signature, documents, form]);

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    if (!isFormComplete) return;

    try {
      const user = auth().currentUser;
      if (!user) return;

      // Upload profile image
      const profileImageUrl = await uploadFile(
        profileImage.uri,
        `doctors/${user.uid}/profile.jpg`
      );

      // Upload signature
      const signatureUrl = await uploadFile(
        signature.uri,
        `doctors/${user.uid}/signature.jpg`
      );

      // Upload documents
      const documentUrls = [];
      for (let i = 0; i < documents.length; i++) {
        const url = await uploadFile(
          documents[i].uri,
          `doctors/${user.uid}/documents/doc_${i}.jpg`
        );
        documentUrls.push(url);
      }

      // Save Firestore data
      await firestore()
        .collection('doctors')
        .doc(user.uid)
        .update({
          ...form,
          profileImageUrl,
          signatureUrl,
          documentUrls,
          profileCompleted: true,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert(
        'Profile Submitted',
        'Your profile has been sent for verification.',
        [{ text: 'OK', onPress: () => setIsEditing(false) }]
      );
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Fill your professional information:</Text>

      {/* Profile Image */}
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={() => pickImage(setProfileImage)}
        disabled={!isEditing}
      >
        <Image
          source={
            profileImage
              ? { uri: profileImage.uri }
              : require('../../assets/images/avatar.png')
          }
          style={styles.avatar}
        />
        {isEditing && <Text style={styles.camera}>📷</Text>}
      </TouchableOpacity>

      <Input label="Registration Number" value={form.regNo} editable={isEditing} onChange={v => onChange('regNo', v)} />
      <Input label="City of Practice" value={form.city} editable={isEditing} onChange={v => onChange('city', v)} />
      <Input label="Qualification" value={form.qualification} editable={isEditing} onChange={v => onChange('qualification', v)} />
      <Input label="Speciality" value={form.speciality} editable={isEditing} onChange={v => onChange('speciality', v)} />

      <View style={styles.row}>
        <SmallInput label="Further Specialization" value={form.subSpeciality} editable={isEditing} onChange={v => onChange('subSpeciality', v)} />
        <SmallInput label="Experience" value={form.experience} editable={isEditing} onChange={v => onChange('experience', v)} />
      </View>

      <Input label="Charge for 0–5 KM" value={form.charge5} editable={isEditing} onChange={v => onChange('charge5', v)} />
      <Input label="Charge for 5–10 KM" value={form.charge10} editable={isEditing} onChange={v => onChange('charge10', v)} />

      {!isEditing && (
        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
          <Text style={styles.editText}>Edit Information</Text>
        </TouchableOpacity>
      )}

      <UploadButton text="Upload Signature" onPress={() => pickImage(setSignature)} disabled={!isEditing} />
      {signature && <PreviewImage uri={signature.uri} />}

      <UploadButton text="Upload Documents" onPress={pickDocuments} disabled={!isEditing} />
      <View style={styles.previewRow}>
        {documents.map((doc, i) => (
          <Image key={i} source={{ uri: doc.uri }} style={styles.docPreview} />
        ))}
      </View>

      {isEditing && (
        <TouchableOpacity
          style={[styles.saveBtn, !isFormComplete && styles.disabled]}
          disabled={!isFormComplete}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>SAVE</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;

/* ---------------- COMPONENTS ---------------- */

const Input = ({ label, value, onChange, editable }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.readOnly]}
      value={value}
      onChangeText={onChange}
      editable={editable}
      placeholder={label}
    />
  </>
);

const SmallInput = ({ label, value, onChange, editable }) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.readOnly]}
      value={value}
      onChangeText={onChange}
      editable={editable}
      placeholder={label}
    />
  </View>
);

const UploadButton = ({ text, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.uploadBtn, disabled && styles.disabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.uploadText}>{text}</Text>
  </TouchableOpacity>
);

const PreviewImage = ({ uri }) => (
  <Image source={{ uri }} style={styles.previewImage} />
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F8F9F8' },
  title: { fontSize: 14, color: '#333', marginBottom: 10 },

  avatarWrapper: { alignSelf: 'center', marginVertical: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  camera: { position: 'absolute', bottom: 0, right: 0 },

  label: { fontSize: 12, color: '#666', marginTop: 10 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    fontSize: 14,
  },
  readOnly: { backgroundColor: '#EAEAEA' },

  row: { flexDirection: 'row', gap: 10 },

  editBtn: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  editText: { color: '#fff', textAlign: 'center', fontWeight: '600' },

  uploadBtn: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
  },
  uploadText: { color: '#fff', textAlign: 'center' },

  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  docPreview: { width: 80, height: 80, borderRadius: 8 },

  saveBtn: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 30,
  },
  saveText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  disabled: { opacity: 0.4 },
});
