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

export function compareBatchesChronological(
  a: Batch,
  b: Batch,
  indexA: number = 0,
  indexB: number = 0
): number {
  // Extract date string YYYY-MM-DD
  const getDay = (batch: Batch): string => {
    if (batch.date && batch.date.length >= 10) return batch.date.slice(0, 10);
    if (batch.createdAt && batch.createdAt.length >= 10) return batch.createdAt.slice(0, 10);
    return '';
  };

  const dayA = getDay(a);
  const dayB = getDay(b);

  // 1. If different calendar dates (e.g., 2026-09-01 vs 2026-09-07)
  if (dayA && dayB && dayA !== dayB) {
    return dayA.localeCompare(dayB);
  }

  // 2. If same calendar day or missing date, compare exact creation timestamps (ISO string or timestamp in id)
  const getExactTime = (batch: Batch): number => {
    if (batch.createdAt) {
      const t = new Date(batch.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (batch.date && batch.date.includes('T')) {
      const t = new Date(batch.date).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    const idMatch = batch.id?.match(/\d{10,}/);
    if (idMatch) {
      return parseInt(idMatch[0], 10);
    }
    return 0;
  };

  const timeA = getExactTime(a);
  const timeB = getExactTime(b);

  if (timeA !== timeB && timeA > 0 && timeB > 0) {
    return timeA - timeB;
  }

  // 3. If dates & times are identical, maintain original relative index order
  return indexA - indexB;
}

export function getProductMetrics(product: Product): ProductMetrics {
  const rawBatches = [...(product.batches || [])];
  
  // Sort batches chronologically from oldest (0) to newest (length - 1)
  const indexedBatches = rawBatches.map((batch, index) => ({ batch, index }));
  indexedBatches.sort((a, b) => compareBatchesChronological(a.batch, b.batch, a.index, b.index));
  const batches = indexedBatches.map((item) => item.batch);

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
