import { Product, Batch } from '../types';

export interface ProductMetrics {
  totalQuantity: number;
  totalCost: number;
  averagePrice: number;
  latestPrice: number;
  oldestPrice: number;
  previousPrice: number | null;
  priceChange: number;
  priceChangePercent: number;
  batchesCount: number;
  sortedBatches: Batch[];
}

export function getProductMetrics(product: Product): ProductMetrics {
  const batches = [...(product.batches || [])];
  
  // Sort batches chronologically
  batches.sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt).getTime();
    const timeB = new Date(b.date || b.createdAt).getTime();
    return timeA - timeB;
  });

  const totalQuantity = batches.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
  const totalCost = batches.reduce((sum, b) => {
    const qty = Number(b.quantity) || 0;
    const prc = Number(b.pricePerUnit) || 0;
    return sum + (b.totalCost ?? qty * prc);
  }, 0);

  const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  const latestBatch = batches.length > 0 ? batches[batches.length - 1] : null;
  const previousBatch = batches.length > 1 ? batches[batches.length - 2] : null;
  const oldestBatch = batches.length > 0 ? batches[0] : null;

  const latestPrice = latestBatch ? Number(latestBatch.pricePerUnit) || 0 : 0;
  const oldestPrice = oldestBatch ? Number(oldestBatch.pricePerUnit) || 0 : 0;
  const previousPrice = previousBatch ? Number(previousBatch.pricePerUnit) || 0 : null;

  let priceChange = 0;
  let priceChangePercent = 0;

  if (previousPrice !== null && previousPrice > 0) {
    priceChange = latestPrice - previousPrice;
    priceChangePercent = ((latestPrice - previousPrice) / previousPrice) * 100;
  }

  return {
    totalQuantity,
    totalCost,
    averagePrice,
    latestPrice,
    oldestPrice,
    previousPrice,
    priceChange,
    priceChangePercent,
    batchesCount: batches.length,
    sortedBatches: batches,
  };
}

export function formatCurrency(amount: number, currency: string = '₽'): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const parts = rounded.toLocaleString('ru-RU', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${parts} ${currency}`;
}

export function formatNumber(num: number): string {
  return (Math.round((num + Number.EPSILON) * 100) / 100).toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  });
}
