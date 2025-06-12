
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  minStockThreshold?: number;
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface BillItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerName?: string;
  customerPhoneNumber?: string; // Added customerPhoneNumber
  items: BillItem[];
  totalAmount: number;
  timestamp: Date;
}

export type Language = "en" | "hi-IN" | "hi";

export interface UdhaarEntry {
  id: string;
  name: string;
  amount: number;
  phoneNumber?: string;
  description?: string;
  date: Date; // Stays as Date, Firestore handles conversion to/from Timestamp
  type: "payable" | "receivable";
}

