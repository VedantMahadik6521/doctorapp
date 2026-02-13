import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import { Platform, PermissionsAndroid } from 'react-native';

class NotificationService {

    constructor() {
        this.lastMessageId = null;
    }

    // 1. Request Permission
    async requestUserPermission() {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        console.log('Authorization status:', authStatus);
        return enabled;
    }

    // 2. Get FCM Token & Save to Firestore
    async getFCMToken(user) {
        try {
            if (!user) return;

            const token = await messaging().getToken();
            console.log('FCM Token:', token);

            // Update in Firestore
            await firestore().collection('doctors').doc(user.uid).update({
                fcmToken: token,
            });

            return token;
        } catch (error) {
            console.error('FCM Token Error:', error);
        }
    }

    // 3. Create Notification Channel (Android)
    async createChannel() {
        await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });
    }

    // 4. Listeners
    createNotificationListeners() {
        // Background message handler handled in index.js usually, but good to have refs

        // Foreground Message Handler
        this.messageListener = messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived!', remoteMessage);
            this.displayLocalNotification(
                remoteMessage.notification?.title || 'New Notification',
                remoteMessage.notification?.body || ''
            );
        });

        // Background/Quit state notification tap
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage.notification);
            // Navigate to specific screen if needed
        });

        messaging().getInitialNotification().then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification caused app to open from quit state:', remoteMessage.notification);
            }
        });

        // Notifee Foreground Event
        return notifee.onForegroundEvent(({ type, detail }) => {
            switch (type) {
                case EventType.DISMISSED:
                    console.log('User dismissed notification', detail.notification);
                    break;
                case EventType.PRESS:
                    console.log('User pressed notification', detail.notification);
                    break;
            }
        });
    }

    // 5. Display Local Notification (Triggered by App or FCM)
    async displayLocalNotification(title, body) {
        try {
            await this.createChannel(); // Ensure channel exists

            await notifee.displayNotification({
                title: title,
                body: body,
                android: {
                    channelId: 'default',
                    smallIcon: 'ic_launcher', // verify if this exists or use default
                    pressAction: {
                        id: 'default',
                    },
                },
            });
            console.log("Local notification displayed:", title);
        } catch (error) {
            console.error("Display Local Notification Error:", error);
            // Alert mainly for debugging so user sees it locally
            // import { Alert } from 'react-native'; // Need to make sure Alert is imported if using it, 
            // but class doesn't import Alert from react-native.
            // I will add console.error generally, and maybe console.log.
        }
    }

    // Clean up
    unRegister() {
        if (this.messageListener) {
            this.messageListener();
        }
    }
}

export default new NotificationService();
