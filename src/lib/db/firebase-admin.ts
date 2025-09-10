import admin, { ServiceAccount } from 'firebase-admin';

// Get the service account key from an environment variable
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

// Parse the JSON string into a JavaScript object
let serviceAccountData: ServiceAccount;
try {
  serviceAccountData = JSON.parse(serviceAccountString) as ServiceAccount;
} catch (error) {
  throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is valid JSON.');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountData),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const auth = admin.auth();

export { auth as firebaseAdminAuth };