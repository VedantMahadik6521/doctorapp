import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Extended Static Data for All Testimonials
const TESTIMONIALS = [
    {
        id: 1,
        name: 'Dr. Rohan Mishra',
        role: 'Surgeon',
        text: 'I love the flexibility. I can accept requests anytime based on my availability. Fantastic platform for home consultations!',
        rating: 5,
        joined: 'joined 1 year ago',
        color: '#A992E2',
    },
    {
        id: 2,
        name: 'Dr. Sarah Smith',
        role: 'Pediatrician',
        text: 'Great way to connect with patients in need. The interface is very intuitive and easy to use.',
        rating: 5,
        joined: 'joined 6 months ago',
        color: '#FFB7B2',
    },
    {
        id: 3,
        name: 'Dr. Emily Chen',
        role: 'Dermatologist',
        text: 'Helping patients at their homes has never been easier. Highly recommended for doctors looking to expand their reach.',
        rating: 4,
        joined: 'joined 2 years ago',
        color: '#FF9AA2',
    },
    {
        id: 4,
        name: 'Dr. Michael Brown',
        role: 'General Physician',
        text: 'The payment process is smooth and transparent. I really appreciate the support from the team.',
        rating: 5,
        joined: 'joined 3 months ago',
        color: '#E2F0CB',
    },
    {
        id: 5,
        name: 'Dr. Priya Patel',
        role: 'Gynecologist',
        text: 'A wonderful initiative to bridge the gap between doctors and patients. Proud to be a part of this community.',
        rating: 4,
        joined: 'joined 1.5 years ago',
        color: '#B5EAD7',
    },
    {
        id: 6,
        name: 'Dr. James Wilson',
        role: 'Orthopedic',
        text: 'User friendly app and great patient engagement. The location tracking feature is very helpful.',
        rating: 5,
        joined: 'joined 8 months ago',
        color: '#C7CEEA',
    }
];

const AllTestimonialsScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();

    const renderStars = (rating) => {
        return (
            <View style={{ flexDirection: 'row' }}>
                {[...Array(5)].map((_, i) => (
                    <Icon
                        key={i}
                        name="star"
                        size={16}
                        color={i < rating ? '#FFD700' : '#E0E0E0'}
                    />
                ))}
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: item.color || '#A992E2' }]}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.role}>{item.role}</Text>
                </View>
                <Text style={styles.joined}>{item.joined}</Text>
            </View>

            <Text style={styles.reviewText}>"{item.text}"</Text>

            <View style={styles.ratingContainer}>
                {renderStars(item.rating)}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>All Testimonials</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={TESTIMONIALS}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
        paddingVertical: 15,
        // paddingTop: 50, // Handled by SafeAreaView usually, or add Platform specific top padding if needed
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
    },
    card: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    role: {
        fontSize: 14,
        color: '#f0f0f0',
        marginTop: 2,
        fontWeight: '500',
    },
    joined: {
        fontSize: 10,
        color: '#f0f0f0',
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    reviewText: {
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
        fontStyle: 'italic',
        marginBottom: 15,
    },
    ratingContainer: {
        alignItems: 'flex-start',
    }
});

export default AllTestimonialsScreen;
