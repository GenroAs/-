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

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-eggs',
    name: 'Яйца куриные С0 (деревенские)',
    category: 'Продукты питания',
    unit: 'шт',
    createdAt: '2026-09-06T10:00:00.000Z',
    updatedAt: '2026-09-07T08:00:00.000Z',
    batches: [
      {
        id: 'batch-egg-1',
        productId: 'prod-eggs',
        date: '2026-09-06',
        quantity: 10,
        pricePerUnit: 100,
        totalCost: 1000,
        supplier: 'Фермерское подворье',
        note: 'Первая закупка по старой цене',
        createdAt: '2026-09-06T10:00:00.000Z',
      },
      {
        id: 'batch-egg-2',
        productId: 'prod-eggs',
        date: '2026-09-07',
        quantity: 10,
        pricePerUnit: 110,
        totalCost: 1100,
        supplier: 'Фермерское подворье',
        note: 'Вторая закупка по новой цене (+10₽)',
        createdAt: '2026-09-07T08:00:00.000Z',
      },
    ],
  },
  {
    id: 'prod-milk',
    name: 'Молоко натуральное 3.2%',
    category: 'Молочная продукция',
    unit: 'л',
    createdAt: '2026-09-05T09:00:00.000Z',
    updatedAt: '2026-09-06T11:00:00.000Z',
    batches: [
      {
        id: 'batch-milk-1',
        productId: 'prod-milk',
        date: '2026-09-05',
        quantity: 20,
        pricePerUnit: 75,
        totalCost: 1500,
        supplier: 'МолКомбинат',
        note: 'Партия понедельника',
        createdAt: '2026-09-05T09:00:00.000Z',
      },
      {
        id: 'batch-milk-2',
        productId: 'prod-milk',
        date: '2026-09-06',
        quantity: 15,
        pricePerUnit: 80,
        totalCost: 1200,
        supplier: 'МолКомбинат',
        note: 'Свежий завоз',
        createdAt: '2026-09-06T11:00:00.000Z',
      },
    ],
  },
  {
    id: 'prod-oil',
    name: 'Моторное масло Wynn\'s Supreme 5W-40',
    category: 'Автотовары / Wynn\'s',
    unit: 'л',
    createdAt: '2026-09-04T08:00:00.000Z',
    updatedAt: '2026-09-04T08:00:00.000Z',
    batches: [
      {
        id: 'batch-oil-1',
        productId: 'prod-oil',
        date: '2026-09-04',
        quantity: 24,
        pricePerUnit: 850,
        totalCost: 20400,
        supplier: 'Дистрибьютор Wynn\'s',
        note: 'Коробка 24 шт по оптовой цене',
        createdAt: '2026-09-04T08:00:00.000Z',
      },
    ],
  },
];
