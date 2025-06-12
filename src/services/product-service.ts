
// src/services/product-service.ts
'use server';

import { db } from '@/lib/firebase'; // Removed storage import
import type { Product } from '@/types';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  getDoc,
} from 'firebase/firestore';
// Removed Firebase Storage imports

const PRODUCTS_COLLECTION = 'products';

const mapDocToProduct = (docData: any, id: string): Product => {
  const data = {...docData};
  return { id, ...data } as Product;
};

export async function getProducts(): Promise<Product[]> {
  try {
    const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsCollectionRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapDocToProduct(doc.data(), doc.id));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products from Firestore.");
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const productDocRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(productDocRef);
    if (docSnap.exists()) {
      return mapDocToProduct(docSnap.data(), docSnap.id);
    }
    return null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw new Error("Failed to fetch product by ID from Firestore.");
  }
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("Failed to add product to Firestore.");
  }
}

export async function updateProduct(productId: string, productData: Partial<Omit<Product, 'id'>>): Promise<void> {
  try {
    const productDocRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productDocRef, productData);
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product in Firestore.");
  }
}

export async function deleteProductInFirestore(productId: string): Promise<void> {
  try {
    const productDocRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productDocRef);
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    throw new Error("Failed to delete product from Firestore.");
  }
}

export async function updateProductQuantities(items: Array<{ id: string; newQuantity: number }>): Promise<void> {
  const batch = writeBatch(db);
  try {
    items.forEach(item => {
      if (item.newQuantity < 0) {
          console.warn(`Attempted to set negative quantity for product ${item.id}. Setting to 0.`);
          item.newQuantity = 0;
      }
      const productDocRef = doc(db, PRODUCTS_COLLECTION, item.id);
      batch.update(productDocRef, { quantity: item.newQuantity });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error updating product quantities in batch:", error);
    throw new Error("Failed to update product quantities in Firestore.");
  }
}

export async function seedProductsIfEmpty(mockProducts: Omit<Product, 'id'>[]) {
  try {
    const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(query(productsCollectionRef));

    if (snapshot.empty) {
      console.log('Products collection is empty. Seeding data...');
      const batch = writeBatch(db);
      mockProducts.forEach(product => {
        const newDocRef = doc(productsCollectionRef);
        batch.set(newDocRef, product);
      });
      await batch.commit();
      console.log('Successfully seeded products.');
    } else {
      console.log('Products collection is not empty. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}
