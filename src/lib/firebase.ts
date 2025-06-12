
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Enhanced crucial check for Firebase configuration - this runs when the module is imported (server-side)
if (typeof window === 'undefined') { // Only run this check on the server-side
  console.log("\n📣 [SERVER-SIDE Firebase Init] Verifying environment variables for Firebase config...");
  let configError = false;
  let criticalErrorDetails = "";

  // Explicitly log the storage bucket value for debugging
  console.log("🔧 [DEBUG] Raw NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET value from process.env:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

  if (!firebaseConfig.apiKey) {
    const msg = "NEXT_PUBLIC_FIREBASE_API_KEY is NOT DEFINED. This is essential for Firebase services.";
    criticalErrorDetails += `\n- ${msg}`;
    console.error(`\n❌ CRITICAL Firebase Config Error: ${msg}\nACTION REQUIRED: Set it in your .env file and RESTART your Next.js server.\n`);
    configError = true;
  }

  if (!firebaseConfig.projectId) {
    const msg = "NEXT_PUBLIC_FIREBASE_PROJECT_ID is NOT DEFINED. This is essential for Firestore, Storage, etc.";
    criticalErrorDetails += `\n- ${msg}`;
    console.error(`\n❌ CRITICAL Firebase Config Error: ${msg}\nACTION REQUIRED: Set it in your .env file and RESTART your Next.js server.\n`);
    configError = true;
  }

  if (!firebaseConfig.storageBucket) {
    const msg = "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is NOT DEFINED. This is THE MOST LIKELY CAUSE of 'storage/unknown' errors. Expected format: 'your-project-id.appspot.com' or 'your-project-id.firebasestorage.app'.";
    criticalErrorDetails += `\n- ${msg}`;
    console.error(`\n❌ CRITICAL Firebase Config Error: ${msg}\nACTION REQUIRED: Set it in your .env file and RESTART your Next.js server.\n`);
    configError = true;
  } else if (!firebaseConfig.storageBucket.includes('.appspot.com') && !firebaseConfig.storageBucket.includes('.firebasestorage.app')) {
    const msg = `The value for NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ('${firebaseConfig.storageBucket}') does not look like a standard Firebase Storage bucket URL.`;
    console.warn(
      `\n⚠️ Firebase Config Warning: ${msg}\n` +
      "Please double-check that this value is correct. If it is, you can ignore this warning. " +
      "If incorrect, fix it in your .env file and RESTART your Next.js server.\n"
    );
  }
  
  console.log("📣 [SERVER-SIDE Firebase Init] Effective firebaseConfig being used by initializeApp:", firebaseConfig);

  if (configError) {
    console.error(`🔥🔥🔥 Due to critical Firebase configuration errors, Firebase services (especially Storage) may not work. Please check the messages above. Details:${criticalErrorDetails} 🔥🔥🔥\n`);
  } else {
    console.log("✅ [SERVER-SIDE Firebase Init] Critical Firebase environment variables appear to be present. If 'storage/unknown' persists, ensure Storage is enabled in Firebase Console and check network/DNS.\n");
  }
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

export { app, auth, db, storage, firebaseConfig };
