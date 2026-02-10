import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const FeedbackScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [existingDocId, setExistingDocId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  React.useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        setInitialLoading(false);
        return;
      }

      const snapshot = await firestore()
        .collection('doctors')
        .doc(user.uid)
        .collection('feedback')
        .orderBy('createdAt', 'desc') // Get the latest one
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setRating(data.rating || 4);
        setFeedback(data.feedback || '');
        setExistingDocId(doc.id);
        setIsEditing(false); // Set to read-only mode if feedback exists
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert("Feedback Required", "Please enter your feedback before submitting.");
      return;
    }

    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to submit feedback.");
        setLoading(false);
        return;
      }

      // Always create a NEW entry to keep history
      const feedbackData = {
        rating: rating,
        feedback: feedback,
        createdAt: firestore.FieldValue.serverTimestamp(),
        doctorId: user.uid,
        status: 'Submitted'
      };

      const feedbackRef = firestore()
        .collection('doctors')
        .doc(user.uid)
        .collection('feedback');

      await feedbackRef.add(feedbackData);

      // We don't need to track existingDocId for updates anymore since we always create new
      // But we can refresh the view or just stay in read-only mode with new data

      Alert.alert("Success", "Thank you! Your feedback has been recorded.");

      setIsEditing(false); // Switch back to read-only mode

    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isEditing ? 'Please rate your experience below' : 'Your submitted feedback'}
        </Text>

        {/* Stars */}
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => isEditing && setRating(item)}
              disabled={!isEditing}
            >
              <Icon
                name="star"
                size={32}
                color={item <= rating ? '#FFC107' : '#E0E0E0'}
              />
            </TouchableOpacity>
          ))}
          <Text style={styles.ratingText}>{rating}/5 stars</Text>
        </View>

        {/* Feedback */}
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Additional feedback
        </Text>

        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.primary },
            !isEditing && {
              backgroundColor: theme.isDarkMode ? '#2C2C2C' : '#E8E8E8',
              opacity: 1,
              borderColor: 'transparent',
              color: '#888'
            }
          ]}
          placeholder="My feedback!!"
          placeholderTextColor="#999"
          multiline
          value={feedback}
          onChangeText={setFeedback}
          editable={isEditing}
        />

        {/* Submit / Edit Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            if (isEditing) {
              handleSubmit();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isEditing ? 'Submit feedback' : 'Edit feedback'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#4F8EF7',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 16,
  },
  title: {
    fontSize: 15,
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 10,
    color: '#777',
    fontSize: 13,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
