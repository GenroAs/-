export interface Batch {
  id: string;
  productId: string;
  date: string; // YYYY-MM-DD or ISO
  quantity: number;
  pricePerUnit: number;
  totalCost: number; // quantity * pricePerUnit
  supplier?: string;
  note?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string; // шт, кг, л, уп, коробка, etc.
  batches: Batch[];
  createdAt: string;
  updatedAt: string;
}

export interface CalculationItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  appliedBatches?: {
    batchId: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  isNewBatch?: boolean; // If checked, this addition also registers as a new batch in product history
  note?: string;
}

export interface CalculationRecord {
  id: string;
  title: string;
  date: string;
  items: CalculationItem[];
  totalAmount: number;
  totalQuantity: number;
  notes?: string;
  createdAt: string;
}

export interface AppData {
  syncId: string;
  currency: string;
  products: Product[];
  calculations: CalculationRecord[];
  lastModified: number;
}

export const DEFAULT_ROOM_ID = 'wynns-jyrgal-gulnura';

export const CURRENCIES = [
  { code: 'RUB', symbol: '₽', label: 'Рубль (₽)' },
  { code: 'KGS', symbol: 'сом', label: 'Сом (сом)' },
  { code: 'USD', symbol: '$', label: 'Доллар ($)' },
  { code: 'EUR', symbol: '€', label: 'Евро (€)' },
  { code: 'KZT', symbol: '₸', label: 'Тенге (₸)' },
];

export const COMMON_UNITS = ['шт', 'кг', 'л', 'уп', 'кор', 'м', 'пачка'];

export const INITIAL_PRODUCTS: Product[] = [];
