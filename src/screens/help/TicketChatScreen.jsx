import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const TicketChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { ticket } = route.params || {};
    const { theme } = useTheme();

    const [messages, setMessages] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);

    const currentUser = auth().currentUser;

    useEffect(() => {
        if (!ticket || !currentUser) return;

        const unsubscribe = firestore()
            .collection('doctors')
            .doc(currentUser.uid)
            .collection('Ticket')
            .doc(ticket.id)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .onSnapshot(snapshot => {
                const fetchedMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(fetchedMessages);
                // Scroll to bottom when messages load
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 500);
            }, error => {
                console.error("Error fetching messages:", error);
            });

        return () => unsubscribe();
    }, [ticket]);

    const handleSend = async () => {
        if (!inputText.trim() || !currentUser || !ticket) return;

        setSending(true);
        try {
            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
                .collection('Ticket')
                .doc(ticket.id)
                .collection('messages')
                .add({
                    text: inputText.trim(),
                    senderId: currentUser.uid,
                    senderType: 'doctor', // 'doctor' or 'admin'
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });

            setInputText('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleReceiveAdminMessage = async () => {
        if (!currentUser || !ticket) return;

        try {
            await firestore()
                .collection('doctors')
                .doc(currentUser.uid)
                .collection('Ticket')
                .doc(ticket.id)
                .collection('messages')
                .add({
                    text: "This is a dummy admin message.",
                    senderId: 'admin_123', // distinct senderId
                    senderType: 'admin',
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
            console.log("Dummy admin message added");
        } catch (error) {
            console.error("Error adding dummy admin message:", error);
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.senderType === 'doctor' || item.senderId === currentUser.uid;

        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
                    { backgroundColor: isMyMessage ? '#DCF8C6' : '#FFFFFF' }
                ]}>
                    <Text style={[styles.messageText, { color: '#000' }]}>
                        {item.text}
                    </Text>
                    <Text style={styles.timestamp}>
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#ECE5DD' }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#ECE5DD" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: '#FFF' }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Admin</Text>
                </View>
                {/* Temporary Debug Button for Admin Messages */}
                <TouchableOpacity onPress={handleReceiveAdminMessage} style={{ padding: 5 }}>
                    <Icon name="person-add" size={24} color="red" />
                </TouchableOpacity>
            </View>



            <FlatList
                ref={flatListRef}
                data={showAll ? messages : messages.slice(-5)}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    !showAll && messages.length > 5 ? (
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => setShowAll(true)}
                        >
                            <Text style={styles.viewAllText}>View All Messages</Text>
                        </TouchableOpacity>
                    ) : null
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: '#FFF' }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message"
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSend}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Icon name="send" size={24} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        elevation: 2,
    },
    backButton: {
        padding: 5,
    },
    headerInfo: {
        marginLeft: 10,
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    messagesList: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    messageContainer: {
        marginVertical: 5,
        flexDirection: 'row',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 10,
        borderRadius: 10,
        elevation: 1,
    },
    myMessageBubble: {
        borderTopRightRadius: 0,
    },
    otherMessageBubble: {
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 15,
    },
    timestamp: {
        fontSize: 10,
        color: '#999',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
        color: '#000',
    },
    sendButton: {
        backgroundColor: '#00897B', // Whatsapp-like green or app primary color
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    viewAllButton: {
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    viewAllText: {
        color: '#00897B',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default TicketChatScreen;
