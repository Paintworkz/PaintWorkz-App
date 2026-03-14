const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Init Firebase Admin
let app;
let db;
function getDb() {
    if (!app) {
        app = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
        db = getFirestore(app);
    }
    return db;
}

const PRICE_TO_PLAN = {
    'pri_01kk8wzrkz9qwrrs98nsp1yegx': 'solo',
    'pri_01kk8x2cqt2983dm2fz9rcekmx': 'pro',
};

async function findUidByEmail(email, customData) {
    // Method 1: Firebase Auth lookup — most reliable
    try {
        const authUser = await getAuth(app).getUserByEmail(email);
        if (authUser) { console.log('Found via Auth:', authUser.uid); return authUser.uid; }
    } catch(e) { console.warn('Auth lookup failed:', e.message); }

    // Method 2: Firestore document search
    try {
        const snapshot = await getDb().collection('users').get();
        let found = null;
        snapshot.forEach(doc => {
            const d = doc.data();
            if (d.email === email || d.userEmail === email) found = doc.id;
        });
        if (found) { console.log('Found via Firestore:', found); return found; }
    } catch(e) { console.warn('Firestore search failed:', e.message); }

    // Method 3: UID in Paddle custom_data
    if (customData && customData.uid) { console.log('Found via custom_data:', customData.uid); return customData.uid; }

    return null;
}

async function setPlan(uid, plan, data) {
    const firestore = getDb();
    await firestore.collection('users').doc(uid).set({
        plan: plan,
        planUpdatedAt: new Date().toISOString(),
        paddleSubscriptionId: data?.id || '',
        paddleCustomerId: data?.customer_id || '',
    }, { merge: true });
    await firestore.collection('users').doc(uid).collection('appData').doc('settings').set({
        plan: plan,
        planUpdatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('Updated', uid, 'to plan:', plan);
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

    try {
        const payload = JSON.parse(event.body);
        const eventType = payload.event_type;
        const data = payload.data;
        const email = data?.customer?.email || '';
        const customData = data?.custom_data || {};
        const priceId = data?.items?.[0]?.price?.id;
        const plan = PRICE_TO_PLAN[priceId] || 'solo';

        console.log('Webhook:', eventType, 'email:', email, 'priceId:', priceId, 'plan:', plan);

        getDb(); // ensure initialized

        if (['subscription.activated','subscription.updated','transaction.completed'].includes(eventType)) {
            const uid = await findUidByEmail(email, customData);
            if (uid) {
                await setPlan(uid, plan, data);
            } else {
                console.warn('No user found for email:', email);
            }
        }

        if (['subscription.cancelled','subscription.paused','subscription.past_due'].includes(eventType)) {
            const uid = await findUidByEmail(email, customData);
            if (uid) await setPlan(uid, 'free', data);
        }

        return { statusCode: 200, body: 'OK' };
    } catch(err) {
        console.error('Webhook error:', err);
        return { statusCode: 500, body: err.message };
    }
};
