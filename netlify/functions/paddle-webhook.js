const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Init Firebase Admin from environment variables
let db;
function getDb() {
    if (!db) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
        db = getFirestore();
    }
    return db;
}

// Map Paddle price IDs to plan names
const PRICE_TO_PLAN = {
    'pri_01kk8wzrkz9qwrrs98nsp1yegx': 'solo',  // Solo
    'pri_01kk8x2cqt2983dm2fz9rcekmx': 'pro',   // Pro
};

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        console.log('Paddle webhook received:', payload.event_type);

        const eventType = payload.event_type;
        const data = payload.data;

        // Get customer email
        const email = data?.customer?.email || data?.items?.[0]?.price?.billing_cycle?.email;
        const customData = data?.custom_data || {};
        const priceId = data?.items?.[0]?.price?.id;
        const plan = PRICE_TO_PLAN[priceId] || 'solo';

        // Handle relevant events
        if ([
            'subscription.activated',
            'subscription.updated', 
            'transaction.completed'
        ].includes(eventType)) {

            // Find user by email in Firebase
            const firestore = getDb();
            const usersRef = firestore.collection('users');
            
            // Search for user with matching email
            const snapshot = await usersRef.get();
            let targetUid = null;

            snapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.email === email || userData.userEmail === email) {
                    targetUid = doc.id;
                }
            });

            // Also check if UID was passed in custom_data
            if (!targetUid && customData.uid) {
                targetUid = customData.uid;
            }

            if (targetUid) {
                await firestore.collection('users').doc(targetUid).set({
                    plan: plan,
                    planUpdatedAt: new Date().toISOString(),
                    paddleSubscriptionId: data?.id || '',
                    paddleCustomerId: data?.customer_id || '',
                }, { merge: true });

                // Also update appData/settings
                await firestore.collection('users').doc(targetUid)
                    .collection('appData').doc('settings').set({
                        plan: plan,
                        planUpdatedAt: new Date().toISOString(),
                    }, { merge: true });

                console.log(`✓ Updated user ${targetUid} to plan: ${plan}`);
            } else {
                console.warn(`⚠️ No user found for email: ${email}`);
            }
        }

        // Handle cancellation/expiry
        if ([
            'subscription.cancelled',
            'subscription.paused',
            'subscription.past_due'
        ].includes(eventType)) {

            const firestore = getDb();
            const usersRef = firestore.collection('users');
            const snapshot = await usersRef.get();
            let targetUid = null;

            snapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.email === email || userData.userEmail === email) {
                    targetUid = doc.id;
                }
            });

            if (!targetUid && customData.uid) targetUid = customData.uid;

            if (targetUid) {
                await firestore.collection('users').doc(targetUid).set({
                    plan: 'free',
                    planUpdatedAt: new Date().toISOString(),
                }, { merge: true });

                await firestore.collection('users').doc(targetUid)
                    .collection('appData').doc('settings').set({
                        plan: 'free',
                        planUpdatedAt: new Date().toISOString(),
                    }, { merge: true });

                console.log(`✓ Downgraded user ${targetUid} to free`);
            }
        }

        return { statusCode: 200, body: 'OK' };

    } catch (err) {
        console.error('Webhook error:', err);
        return { statusCode: 500, body: err.message };
    }
};
