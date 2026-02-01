import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

const FeedbackScreen = () => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    console.log({
      rating,
      feedback,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Please rate your experience below
        </Text>

        {/* Stars */}
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((item) => (
            <TouchableOpacity key={item} onPress={() => setRating(item)}>
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
          ]}
          placeholder="My feedback!!"
          placeholderTextColor="#999"
          multiline
          value={feedback}
          onChangeText={setFeedback}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Submit feedback</Text>
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
