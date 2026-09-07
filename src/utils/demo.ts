import { Product, Batch } from '../types';

export function generateTestProducts(count: number = 1000): Product[] {
  const categories = [
    'Автохимия Wynn\'s',
    'Моторные масла',
    'Запчасти и фильтры',
    'Продукты питания',
    'Бакалея и крупы',
    'Напитки и соки',
    'Хозтовары и химия',
    'Упаковочные материалы',
    'Инструменты',
    'Расходные материалы',
  ];

  const productTemplates: Record<string, string[]> = {
    'Автохимия Wynn\'s': [
      'Очиститель инжектора Wynn\'s Injection Purge',
      'Присадка в масло Wynn\'s Super Charge',
      'Очиститель клапанов Wynn\'s Petrol Valve Cleaner',
      'Промывка масляной системы Wynn\'s Engine Flush',
      'Герметик радиатора Wynn\'s Radiator Stop Leak',
      'Очиститель турбокомпрессора Turbo Cleaner',
      'Очиститель сажевого фильтра DPF Regenerator',
      'Очиститель дроссельной заслонки Air Intake',
      'Очиститель кондиционера Wynn\'s Airco-Clean',
      'Высокотемпературная медная смазка Copper Paste',
    ],
    'Моторные масла': [
      'Моторное масло Wynn\'s 5W-30 Synthetic',
      'Моторное масло 5W-40 Ultra Power',
      'Масло полусинтетическое 10W-40 Super',
      'Масло трансмиссионное 75W-90 GL-5',
      'Масло гидравлическое Hydro HLP 46',
      'Жидкость для АКПП ATF Multi-Vehicle',
      'Масло компрессорное Compressor VDL 100',
    ],
    'Запчасти и фильтры': [
      'Масляный фильтр W-712/43',
      'Воздушный фильтр AP-180',
      'Салонный угольный фильтр CUK-2939',
      'Топливный фильтр WK-853',
      'Иридиевые свечи зажигания (компл. 4 шт)',
      'Ремень поликлиновой 6PK-1195',
      'Тормозные колодки керамические передние',
    ],
    'Продукты питания': [
      'Яйца куриные С0 отборные (10 шт)',
      'Яйца куриные С1 фермерские (10 шт)',
      'Масло сливочное ГОСТ 82.5% (180 г)',
      'Сыр Российский твердый 50%',
      'Творог натуральный 9% (250 г)',
      'Молоко пастеризованное 3.2% (1 л)',
      'Сметана домашняя 20% (350 г)',
    ],
    'Бакалея и крупы': [
      'Сахар-песок фасованный (мешок 50 кг)',
      'Мука пшеничная высший сорт (2 кг)',
      'Рис круглозерный шлифованный (1 кг)',
      'Гречневая крупа ядрица (800 г)',
      'Макароны спагетти твердых сортов (450 г)',
      'Масло подсолнечное рафинированное (1 л)',
      'Чай черный цейлонский листовой (200 г)',
    ],
    'Хозтовары и химия': [
      'Концентрат для мытья посуды (5 л)',
      'Микрофибра профессиональная для авто (упак)',
      'Жидкое антибактериальное мыло (5 л)',
      'Нитриловые перчатки плотные (100 шт)',
      'Мешки для мусора сверхпрочные 120 л',
      'Бумажные полотенца двухслойные рулон',
    ],
    'Инструменты': [
      'Набор торцевых головок 1/2 (94 предм.)',
      'Ключ комбинированный рожково-накидной 17мм',
      'Реверсивная отвертка с набором бит',
      'Фонарь инспекционный светодиодный',
      'Шприц плунжерный для смазки 500 мл',
    ],
    'Расходные материалы': [
      'Хомуты пластиковые черные 4x200 мм (100 шт)',
      'Изолента ПВХ профессиональная черная',
      'Отрезной круг по металлу 125x1.2 мм',
      'Очиститель тормозных дисков спрей 500 мл',
      'WD-смазка проникающая аэрозоль 400 мл',
    ],
  };

  const now = new Date();
  const result: Product[] = [];

  for (let i = 1; i <= count; i++) {
    const catKeys = Object.keys(productTemplates);
    const category = catKeys[(i - 1) % catKeys.length];
    const templates = productTemplates[category];
    const baseName = templates[(i - 1) % templates.length];
    const serial = Math.floor((i - 1) / templates.length) + 1;
    const name = serial === 1 ? baseName : `${baseName} (партия №${serial})`;

    const unit =
      category === 'Моторные масла'
        ? 'л'
        : category === 'Бакалея и крупы' && i % 3 === 0
        ? 'кг'
        : 'шт';

    const prodId = `test-prod-${i}`;

    // Base price
    const basePrice = Math.round(35 + (i % 50) * 20 + ((i * 19) % 350));
    // 1 to 3 batches to show multi-price FIFO/averaging
    const batchCount = (i % 3) + 1;
    const batches: Batch[] = [];

    for (let b = 1; b <= batchCount; b++) {
      const daysAgo = (batchCount - b) * 3 + (i % 7);
      const batchDate = new Date(now.getTime() - daysAgo * 24 * 3600 * 1000).toISOString().slice(0, 10);
      // Different prices across batches: older is cheaper or more expensive
      const priceVariation = (b - 1) * Math.round(basePrice * 0.1);
      const batchPrice = Math.max(10, basePrice + priceVariation);
      const batchQty = Math.round(10 + ((i * 5 + b * 9) % 40));

      batches.push({
        id: `test-batch-${i}-${b}`,
        productId: prodId,
        date: batchDate,
        quantity: batchQty,
        pricePerUnit: batchPrice,
        totalCost: batchQty * batchPrice,
        supplier: b === 1 ? 'Центральный склад' : 'Дополнительный завоз',
        note: b > 1 ? `Партия #${b} по обновленной цене` : `Стартовая поставка #${b}`,
        createdAt: new Date(now.getTime() - daysAgo * 24 * 3600 * 1000).toISOString(),
      });
    }

    result.push({
      id: prodId,
      name,
      category,
      unit,
      batches,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  return result;
}

export function getStorageUsage(data: any): {
  bytes: number;
  kb: number;
  mb: number;
  formatted: string;
  percentOfQuota: number; // based on typical 5MB localStorage
} {
  try {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    const kb = Math.round((bytes / 1024) * 10) / 10;
    const mb = Math.round((kb / 1024) * 100) / 100;
    // Standard browser localStorage limit is 5MB (5120 KB)
    const quotaKb = 5120;
    const percentOfQuota = Math.min(100, Math.round((kb / quotaKb) * 1000) / 10);
    const formatted = mb >= 1 ? `${mb} МБ` : `${kb} КБ`;

    return { bytes, kb, mb, formatted, percentOfQuota };
  } catch {
    return { bytes: 0, kb: 0, mb: 0, formatted: '0 КБ', percentOfQuota: 0 };
  }
}
