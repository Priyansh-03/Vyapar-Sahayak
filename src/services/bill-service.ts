
// src/services/bill-service.ts
'use server';

import { db } from '@/lib/firebase';
import type { Bill } from '@/types';
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  runTransaction, // Added for atomic counter
  getDoc, // Added for counter fallback
} from 'firebase/firestore';

const BILLS_COLLECTION = 'bills';
const BILL_COUNTER_DOC_PATH = 'app_config/billCounter'; // Path for the bill counter document

const mapDocToBill = (docData: any, id: string): Bill => {
  const data = { ...docData };
  // Convert Firestore Timestamp to JavaScript Date object for timestamp
  if (data.timestamp && data.timestamp instanceof Timestamp) {
    data.timestamp = data.timestamp.toDate();
  }
  // Ensure items is an array, even if it's missing in Firestore (should not happen with proper saving)
  data.items = Array.isArray(data.items) ? data.items : [];
  return { id, ...data } as Bill;
};

export async function getNextBillNumber(): Promise<string> {
  const counterDocRef = doc(db, BILL_COUNTER_DOC_PATH);
  try {
    let nextNumber = 1;
    await runTransaction(db, async (transaction) => {
      const counterDocSnap = await transaction.get(counterDocRef);
      if (!counterDocSnap.exists()) {
        // Initialize counter if it doesn't exist, starting next bill as 1
        transaction.set(counterDocRef, { lastNumber: 1 });
        nextNumber = 1;
      } else {
        const lastNumber = counterDocSnap.data().lastNumber || 0;
        nextNumber = lastNumber + 1;
        transaction.update(counterDocRef, { lastNumber: nextNumber });
      }
    });
    return String(nextNumber);
  } catch (error) {
    console.error("Error getting next bill number with transaction, using timestamp fallback:", error);
    // Fallback to a timestamp-based unique string if the transaction fails
    // This ensures bill generation can still proceed, albeit not with a sequential number.
    return `ERR-${Date.now().toString().slice(-6)}`;
  }
}

export async function addBillToFirestore(billData: Bill): Promise<Bill> {
  try {
    // Use the billData.id as the document ID in Firestore
    const billDocRef = doc(db, BILLS_COLLECTION, billData.id);
    // Convert Date to Timestamp for consistent Firestore storage if not already
    const dataToSave = {
      ...billData,
      timestamp: billData.timestamp instanceof Date ? Timestamp.fromDate(billData.timestamp) : billData.timestamp,
    };
    await setDoc(billDocRef, dataToSave);
    return billData; // Return the original billData as it contains the ID
  } catch (error) {
    console.error("Error adding bill to Firestore:", error);
    throw new Error(`Failed to add bill to Firestore: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getBillsFromFirestore(): Promise<Bill[]> {
  try {
    const billsCollectionRef = collection(db, BILLS_COLLECTION);
    // Order by timestamp in descending order to show newest bills first
    // Note: If you want to sort by the new numeric billNumber, you'd need to ensure it's stored as a number
    // or handle mixed-type sorting carefully on the client-side. For now, timestamp sorting remains.
    const q = query(billsCollectionRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapDocToBill(doc.data(), doc.id));
  } catch (error) {
    console.error("Error fetching bills from Firestore:", error);
    throw new Error("Failed to fetch bills from Firestore.");
  }
}

