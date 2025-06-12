
// src/services/udhaar-service.ts
'use server';

import { db } from '@/lib/firebase';
import type { UdhaarEntry } from '@/types';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  Timestamp, // Import Timestamp
} from 'firebase/firestore';
import { initialUdhaarEntriesData } from '@/data/mock-data'; // For seeding

const UDHAAR_COLLECTION = 'udhaarEntries';

const mapDocToUdhaarEntry = (docData: any, id: string): UdhaarEntry => {
  const data = { ...docData };
  // Convert Firestore Timestamp to JavaScript Date object
  if (data.date && data.date instanceof Timestamp) {
    data.date = data.date.toDate();
  }
  return { id, ...data } as UdhaarEntry;
};

export async function getUdhaarEntries(): Promise<UdhaarEntry[]> {
  try {
    const udhaarCollectionRef = collection(db, UDHAAR_COLLECTION);
    const q = query(udhaarCollectionRef); // Can add orderBy here if needed, e.g., orderBy("date", "desc")
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapDocToUdhaarEntry(doc.data(), doc.id));
  } catch (error) {
    console.error("Error fetching udhaar entries:", error);
    throw new Error("Failed to fetch udhaar entries from Firestore.");
  }
}

export async function addUdhaarEntry(entryData: Omit<UdhaarEntry, 'id'>): Promise<UdhaarEntry> {
  try {
    // JavaScript Date objects are automatically converted to Timestamps by Firestore
    const docRef = await addDoc(collection(db, UDHAAR_COLLECTION), entryData);
    // Construct the returned object directly with the new ID and the data provided.
    // The entryData already contains all necessary fields (name, amount, client-set date, etc.)
    return { id: docRef.id, ...entryData };
  } catch (error) {
    console.error("Error adding udhaar entry:", error);
    throw new Error(`Failed to add udhaar entry to Firestore: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateUdhaarEntry(entryId: string, entryData: Partial<Omit<UdhaarEntry, 'id'>>): Promise<void> {
  try {
    const entryDocRef = doc(db, UDHAAR_COLLECTION, entryId);
    // If date is part of entryData and is a JS Date, it will be converted
    await updateDoc(entryDocRef, entryData);
  } catch (error) {
    console.error("Error updating udhaar entry:", error);
    throw new Error("Failed to update udhaar entry in Firestore.");
  }
}

export async function deleteUdhaarEntry(entryId: string): Promise<void> {
  try {
    const entryDocRef = doc(db, UDHAAR_COLLECTION, entryId);
    await deleteDoc(entryDocRef);
  } catch (error) {
    console.error("Error deleting udhaar entry:", error);
    throw new Error("Failed to delete udhaar entry from Firestore.");
  }
}

export async function seedUdhaarEntriesIfEmpty() {
  try {
    const udhaarCollectionRef = collection(db, UDHAAR_COLLECTION);
    const snapshot = await getDocs(query(udhaarCollectionRef));

    if (snapshot.empty) {
      console.log('Udhaar entries collection is empty. Seeding data...');
      const batch = writeBatch(db);
      initialUdhaarEntriesData.forEach(entry => {
        const newDocRef = doc(udhaarCollectionRef); // Auto-generate ID
        batch.set(newDocRef, entry); // Firestore will convert JS Dates in 'entry' to Timestamps
      });
      await batch.commit();
      console.log('Successfully seeded udhaar entries.');
    } else {
      console.log('Udhaar entries collection is not empty. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding udhaar entries:', error);
    // Not throwing error to prevent app crash if seeding fails, just log it
  }
}

