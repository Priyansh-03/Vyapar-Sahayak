
// src/data/mock-data.ts
import type { Product, UdhaarEntry } from "@/types";

export const DEFAULT_GLOBAL_LOW_STOCK_THRESHOLD = 10;

export interface UserProfileData {
  name: string;
  email: string;
  joinedDate: Date;
}

export let userProfileData: UserProfileData = {
  name: "Ramesh Kumar",
  email: "ramesh.kumar@example.com",
  joinedDate: new Date(2023, 0, 15),
};

// This array is intended for initial seeding if Firestore is empty.
export const initialProductsArray: Omit<Product, 'id'>[] = [
  { name: "Parle-G Biscuit", category: "Biscuits", price: 10, quantity: 150, minStockThreshold: 20 },
  { name: "Lays Classic Chips", category: "Snacks", price: 20, quantity: 8 },
  { name: "Coca-Cola 500ml", category: "Beverages", price: 40, quantity: 75 },
  { name: "Amul Milk 1L", category: "Dairy", price: 55, quantity: 30, minStockThreshold: 5 },
  { name: "Surf Excel 1kg", category: "Detergent", price: 120, quantity: 5 },
  { name: "Colgate MaxFresh", category: "Oral Care", price: 50, quantity: 60 },
  { name: "Maggi Noodles", category: "Instant Food", price: 12, quantity: 100 },
  { name: "Dairy Milk Silk", category: "Chocolates", price: 70, quantity: 3, minStockThreshold: 0 },
  { name: "Aashirvaad Atta 5kg", category: "Staples", price: 250, quantity: 50, minStockThreshold: 10 },
  { name: "Tata Salt 1kg", category: "Staples", price: 25, quantity: 80, minStockThreshold: 15 },
  { name: "Red Label Tea 250g", category: "Beverages", price: 130, quantity: 40 },
  { name: "Good Day Cookies", category: "Biscuits", price: 30, quantity: 0, minStockThreshold: 5 },
  { name: "Sunfeast Dark Fantasy", category: "Chocolates", price: 35, quantity: 2, minStockThreshold: 5 },
];

// Renamed for clarity, will be used for seeding Firestore.
export const initialUdhaarEntriesData: Omit<UdhaarEntry, 'id'>[] = [
  { name: "Amit Sharma", amount: 500, phoneNumber: "9876543210", description: "Groceries", date: new Date(2024, 6, 15), type: "receivable" },
  { name: "Sunita Devi", amount: 250, description: "Milk supply", date: new Date(2024, 6, 20), type: "payable" },
  { name: "Rajesh Electrician", amount: 1200, phoneNumber: "9988776655", date: new Date(2024, 5, 10), type: "payable" },
  { name: "Vikas Kirana Store", amount: 350, description: "Pending payment", date: new Date(2024, 6, 22), type: "receivable" },
];

export const mockSalesHistoryData = "Parle-G Biscuit,Lays Classic Chips,Coca-Cola 500ml,Amul Milk 1L,Maggi Noodles,Parle-G Biscuit,Dairy Milk Silk,Coca-Cola 500ml,Lays Classic Chips,Maggi Noodles";

// This function remains for products, a similar one will be in udhaar-service.ts
export const seedProducts = async () => {
  console.log("Attempting to seed products (mock-data.ts placeholder)...");
};
