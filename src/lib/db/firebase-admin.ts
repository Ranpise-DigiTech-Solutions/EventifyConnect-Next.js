import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

// Type assertion for service account
const serviceAccountData = serviceAccount as ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountData),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const auth = admin.auth();

export { auth as firebaseAdminAuth };
