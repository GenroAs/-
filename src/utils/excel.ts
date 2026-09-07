import * as XLSX from 'xlsx';
import { Product, CalculationRecord, Batch } from '../types';
import { getProductMetrics } from './calc';

export interface ImportedRow {
  name: string;
  category?: string;
  unit?: string;
  quantity: number;
  price: number;
  date?: string;
  supplier?: string;
  note?: string;
}

export function exportDataToExcel(
  products: Product[],
  calculations: CalculationRecord[],
  currency: string = '₽'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary of products
  const productsRows = products.map((p, index) => {
    const metrics = getProductMetrics(p);
    return {
      '№': index + 1,
      'Наименование товара': p.name,
      'Категория': p.category || 'Без категории',
      'Ед. изм.': p.unit || 'шт',
      'Всего количество': metrics.totalQuantity,
      [`Общая сумма расходов (${currency})`]: metrics.totalCost,
      [`Средняя цена за ед. (${currency})`]: Math.round(metrics.averagePrice * 100) / 100,
      [`Текущая (последняя) цена (${currency})`]: metrics.latestPrice,
      'Изменение цены': metrics.previousPrice !== null
        ? `${metrics.priceChange >= 0 ? '+' : ''}${Math.round(metrics.priceChange * 100) / 100} ${currency} (${Math.round(metrics.priceChangePercent * 10) / 10}%)`
        : 'Первая цена',
      'Количество партий/поступлений': metrics.batchesCount,
      'Последнее обновление': new Date(p.updatedAt).toLocaleDateString('ru-RU'),
    };
  });

  const wsProducts = XLSX.utils.json_to_sheet(productsRows);
  // Auto-fit column widths
  wsProducts['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 20 },
    { wch: 10 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 25 },
    { wch: 22 },
    { wch: 25 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Товары и итоги');

  // Sheet 2: Detailed batch history
  const batchesRows: any[] = [];
  let batchIndex = 1;

  products.forEach((p) => {
    const metrics = getProductMetrics(p);
    metrics.sortedBatches.forEach((b) => {
      batchesRows.push({
        '№': batchIndex++,
        'Товар': p.name,
        'Категория': p.category || 'Без категории',
        'Ед. изм.': p.unit || 'шт',
        'Дата партии': b.date || b.createdAt.slice(0, 10),
        'Количество в партии': b.quantity,
        [`Цена закупки за ед. (${currency})`]: b.pricePerUnit,
        [`Итого сумма партии (${currency})`]: b.totalCost ?? (b.quantity * b.pricePerUnit),
        'Поставщик': b.supplier || '',
        'Примечание': b.note || '',
      });
    });
  });

  const wsBatches = XLSX.utils.json_to_sheet(batchesRows);
  wsBatches['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 25 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBatches, 'История изменений цен');

  // Sheet 3: Calculation Sessions History
  const calcRows = calculations.map((c, index) => ({
    '№': index + 1,
    'Название расчета': c.title,
    'Дата': c.date || c.createdAt.slice(0, 10),
    'Всего позиций': c.items.length,
    'Всего количество товаров': c.totalQuantity,
    [`Итоговая сумма (${currency})`]: c.totalAmount,
    'Список товаров': c.items.map((it) => `${it.name} (${it.quantity} ${it.unit} x ${it.pricePerUnit} = ${it.total})`).join('; '),
    'Примечания': c.notes || '',
  }));

  const wsCalcs = XLSX.utils.json_to_sheet(calcRows);
  wsCalcs['!cols'] = [
    { wch: 5 },
    { wch: 28 },
    { wch: 15 },
    { wch: 15 },
    { wch: 24 },
    { wch: 22 },
    { wch: 60 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCalcs, 'История расчетов');

  // Generate file name
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Wynns_Jyrgal_Gulnura_Report_${dateStr}.xlsx`);
}

export function downloadSampleTemplate() {
  const wb = XLSX.utils.book_new();

  const sampleRows = [
    {
      'Наименование': 'Яйца куриные С0',
      'Категория': 'Продукты',
      'Ед. изм.': 'шт',
      'Количество': 10,
      'Цена': 100,
      'Дата': '2026-09-06',
      'Поставщик': 'Ферма Подворье',
      'Примечание': 'Первая партия по 100 руб',
    },
    {
      'Наименование': 'Яйца куриные С0',
      'Категория': 'Продукты',
      'Ед. изм.': 'шт',
      'Количество': 10,
      'Цена': 110,
      'Дата': '2026-09-07',
      'Поставщик': 'Ферма Подворье',
      'Примечание': 'Вторая партия по 110 руб (цена выросла)',
    },
    {
      'Наименование': 'Моторное масло Wynn\'s Supreme 5W-40',
      'Категория': 'Автотовары',
      'Ед. изм.': 'л',
      'Количество': 24,
      'Цена': 850,
      'Дата': '2026-09-05',
      'Поставщик': 'Wynn\'s Official',
      'Примечание': 'Оптовая закупка',
    },
    {
      'Наименование': 'Сахар-песок',
      'Категория': 'Бакалея',
      'Ед. изм.': 'кг',
      'Количество': 50,
      'Цена': 68,
      'Дата': '2026-09-07',
      'Поставщик': 'Оптовый склад',
      'Примечание': 'Мешок 50 кг',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows);
  ws['!cols'] = [
    { wch: 35 },
    { wch: 18 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 22 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Шаблон импорта');
  XLSX.writeFile(wb, 'Wynns_Import_Template.xlsx');
}

export async function parseExcelFile(file: File): Promise<ImportedRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];

  const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

  const result: ImportedRow[] = [];

  for (const row of rawRows) {
    // Find matching keys ignoring case and spaces
    const keys = Object.keys(row);
    const findValue = (...synonyms: string[]) => {
      const match = keys.find((k) =>
        synonyms.some((s) => k.trim().toLowerCase().replace(/[-_.]/g, '') === s.toLowerCase().replace(/[-_.]/g, ''))
      );
      return match ? row[match] : undefined;
    };

    const name = findValue('наименование', 'название', 'товар', 'продукт', 'name', 'product', 'item');
    if (!name || String(name).trim() === '') continue;

    const rawQty = findValue('количество', 'колво', 'кол во', 'остаток', 'qty', 'quantity', 'count');
    const rawPrice = findValue('цена', 'стоимость', 'цена за ед', 'цена закупки', 'price', 'cost', 'rate');
    const category = findValue('категория', 'группа', 'category', 'group');
    const unit = findValue('ед изм', 'единица', 'ед', 'unit');
    const date = findValue('дата', 'дата поступления', 'дата партии', 'date');
    const supplier = findValue('поставщик', 'supplier');
    const note = findValue('примечание', 'комментарий', 'note', 'comment');

    const quantity = parseFloat(String(rawQty).replace(',', '.')) || 1;
    const price = parseFloat(String(rawPrice).replace(',', '.')) || 0;

    result.push({
      name: String(name).trim(),
      category: category ? String(category).trim() : 'Общее',
      unit: unit ? String(unit).trim() : 'шт',
      quantity: Math.max(0, quantity),
      price: Math.max(0, price),
      date: date ? String(date).trim() : new Date().toISOString().slice(0, 10),
      supplier: supplier ? String(supplier).trim() : undefined,
      note: note ? String(note).trim() : undefined,
    });
  }

  return result;
}

export function mergeImportedRowsToProducts(
  currentProducts: Product[],
  importedRows: ImportedRow[],
  mode: 'append' | 'replace'
): Product[] {
  const productsList = mode === 'replace' ? [] : currentProducts.map((p) => ({ ...p, batches: [...p.batches] }));
  
  // Fast lookup Map for instant matching even with 10,000+ items
  const nameMap = new Map<string, Product>();
  for (const p of productsList) {
    nameMap.set(p.name.trim().toLowerCase(), p);
  }

  const now = new Date().toISOString();

  for (const row of importedRows) {
    const normName = row.name.trim().toLowerCase();
    const existingProduct = nameMap.get(normName);

    const batchId = 'batch-' + Math.random().toString(36).substring(2, 9);

    const newBatch: Batch = {
      id: batchId,
      productId: '', // assigned below
      date: row.date || now.slice(0, 10),
      quantity: row.quantity,
      pricePerUnit: row.price,
      totalCost: row.quantity * row.price,
      supplier: row.supplier,
      note: row.note,
      createdAt: now,
    };

    if (existingProduct) {
      newBatch.productId = existingProduct.id;
      existingProduct.batches.push(newBatch);
      existingProduct.updatedAt = now;
      if (row.category && row.category !== 'Общее') existingProduct.category = row.category;
      if (row.unit) existingProduct.unit = row.unit;
    } else {
      const prodId = 'prod-' + Math.random().toString(36).substring(2, 9);
      newBatch.productId = prodId;
      const newProd: Product = {
        id: prodId,
        name: row.name,
        category: row.category || 'Общее',
        unit: row.unit || 'шт',
        batches: [newBatch],
        createdAt: now,
        updatedAt: now,
      };
      productsList.push(newProd);
      nameMap.set(normName, newProd);
    }
  }

  return productsList;
}
