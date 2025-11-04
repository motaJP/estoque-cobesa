import type { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  location: string;
  price: number;
  groupId: string; // ID do grupo/loja
};

export type StockMovement = {
  id: string;
  productName: string;
  productId: string;
  sku: string;
  type: "Entrada" | "Saída";
  quantity: number;
  timestamp: Timestamp | Date | string;
  notes?: string;
  groupId: string; // ID do grupo/loja
};

export type SalesData = {
  productId: string;
  productName: string;
  unitsSold: number;
}
