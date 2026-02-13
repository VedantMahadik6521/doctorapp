const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();
// 1. Send Notification on New Request
exports.sendNewRequestNotification = functions.firestore
    .document("doctors/{doctorId}/patients/{requestId}")
    .onCreate(async (snap, context) => {
        const requestData = snap.data();
        const doctorId = context.params.doctorId; // Get doctorId from path

        if (!doctorId) return;

        try {
            // Get doctor's FCM token (which is on the parent doc "doctors/{doctorId}")
            const doctorDoc = await admin.firestore().collection("doctors").doc(doctorId).get();

            if (!doctorDoc.exists) return;

            const token = doctorDoc.data().fcmToken;
            if (!token) {
                console.log("No FCM token for doctor:", doctorId);
                return;
            }

            const payload = {
                notification: {
                    title: "New Request",
                    body: `New request from ${requestData.patientName || 'a patient'}`,
                },
                data: {
                    requestId: context.params.requestId,
                    type: 'new_request'
                },
                token: token,
            };

            // Save to Firestore for Notification Screen
            await admin.firestore()
                .collection("doctors")
                .doc(doctorId)
                .collection("notifications")
                .add({
                    title: "New Request",
                    message: `New request from ${requestData.patientName || 'a patient'}`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    type: 'new_request',
                    requestId: context.params.requestId,
                    read: false
                });

            await admin.messaging().send(payload);
            console.log("Notification sent to doctor:", doctorId);

        } catch (error) {
            console.error("Error sending notification:", error);
        }
    });

// 2. Send Notification on Advance Payment
exports.advancePaymentNotification = functions.firestore
    .document("doctors/{doctorId}/patients/{requestId}")
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        // Check if advancePaymentStatus changed to 'Completed' OR advancePaid toggled to true
        // Adjust logic based on exact field names in your app
        const paymentJustCompleted =
            (!before.advancePaid && after.advancePaid) ||
            (before.advancePaymentStatus !== 'Completed' && after.advancePaymentStatus === 'Completed') ||
            (!before.isPaymentReceived && after.isPaymentReceived); // Added check for isPaymentReceived

        if (paymentJustCompleted) {
            const doctorId = context.params.doctorId;

            try {
                const doctorDoc = await admin.firestore().collection("doctors").doc(doctorId).get();
                const token = doctorDoc.data().fcmToken;

                if (token) {
                    const messageBody = `Advance payment of ₹${after.advancePaymentAmount || 500} received.`;

                    // Save to Firestore
                    await admin.firestore()
                        .collection("doctors")
                        .doc(doctorId)
                        .collection("notifications")
                        .add({
                            title: "Payment Received",
                            message: messageBody,
                            timestamp: admin.firestore.FieldValue.serverTimestamp(),
                            type: 'payment_received',
                            requestId: context.params.requestId,
                            read: false
                        });

                    await admin.messaging().send({
                        notification: {
                            title: "Payment Received",
                            body: messageBody,
                        },
                        token: token,
                    });
                    console.log("Payment notification sent to:", doctorId);
                }
            } catch (error) {
                console.error("Error sending payment notification:", error);
            }
        }
    });