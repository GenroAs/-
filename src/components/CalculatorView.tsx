import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  Save,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Product, CalculationItem, CalculationRecord, COMMON_UNITS } from '../types';
import { formatCurrency, formatNumber, getProductMetrics } from '../utils/calc';

interface CalculatorViewProps {
  products: Product[];
  currency: string;
  onSaveCalculation: (record: CalculationRecord) => void;
  onAddNewBatchToProduct: (productId: string, batchData: any) => void;
  onAddNewProduct: (productData: any) => void;
  loadedItems?: CalculationItem[] | null;
  loadedTitle?: string | null;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  products,
  currency,
  onSaveCalculation,
  onAddNewBatchToProduct,
  onAddNewProduct,
  loadedItems,
  loadedTitle,
}) => {
  // Inputs
  const [productName, setProductName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('10');
  const [price, setPrice] = useState('100');
  const [unit, setUnit] = useState('шт');
  const [note, setNote] = useState('');
  const [syncToCatalog, setSyncToCatalog] = useState(true);

  // Calculation items in current session
  const [items, setItems] = useState<CalculationItem[]>([
    // Sample preloaded item showing the egg example from the user prompt
    {
      id: 'calc-item-1',
      productId: 'prod-eggs',
      name: 'Яйца куриные С0 (старая цена)',
      quantity: 10,
      unit: 'шт',
      pricePerUnit: 100,
      total: 1000,
      note: 'Первые 10 яиц по 100 ₽',
    },
    {
      id: 'calc-item-2',
      productId: 'prod-eggs',
      name: 'Яйца куриные С0 (актуальная цена)',
      quantity: 10,
      unit: 'шт',
      pricePerUnit: 110,
      total: 1100,
      note: 'Вторые 10 яиц по 110 ₽',
    },
  ]);

  // Title for saving
  const [calcTitle, setCalcTitle] = useState(`Расчет расходов ${new Date().toLocaleDateString('ru-RU')}`);

  // Restore if loaded from history
  React.useEffect(() => {
    if (loadedItems && loadedItems.length > 0) {
      setItems(loadedItems);
      if (loadedTitle) setCalcTitle(loadedTitle);
    }
  }, [loadedItems, loadedTitle]);
  const [calcNotes, setCalcNotes] = useState('');
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Filter existing products for autocomplete
  const filteredProductSuggestions = useMemo(() => {
    if (!productName.trim()) return [];
    const term = productName.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 5);
  }, [productName, products]);

  // Selected product metrics
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  const selectedMetrics = useMemo(() => {
    return selectedProduct ? getProductMetrics(selectedProduct) : null;
  }, [selectedProduct]);

  // When user selects an autocomplete product
  const handleSelectProduct = (p: Product) => {
    setSelectedProductId(p.id);
    setProductName(p.name);
    setUnit(p.unit || 'шт');
    const m = getProductMetrics(p);
    if (m.latestPrice > 0) {
      setPrice(String(m.latestPrice));
    }
  };

  // Instant calculated preview of the row
  const rowQty = parseFloat(quantity) || 0;
  const rowPrice = parseFloat(price) || 0;
  const rowSubtotal = rowQty * rowPrice;

  // Grand totals of the calculation session
  const totalAmount = useMemo(() => {
    return items.reduce((sum, it) => sum + it.total, 0);
  }, [items]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity, 0);
  }, [items]);

  const averageUnitCost = totalQuantity > 0 ? totalAmount / totalQuantity : 0;

  // Add current row to calculation
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productName.trim() || rowQty <= 0) return;

    const newItem: CalculationItem = {
      id: 'item-' + Math.random().toString(36).substring(2, 9),
      productId: selectedProductId || undefined,
      name: productName.trim(),
      quantity: rowQty,
      unit: unit.trim() || 'шт',
      pricePerUnit: rowPrice,
      total: rowSubtotal,
      isNewBatch: syncToCatalog,
      note: note.trim() || undefined,
    };

    setItems((prev) => [...prev, newItem]);

    // If user requested sync to catalog immediately
    if (syncToCatalog) {
      if (selectedProductId) {
        onAddNewBatchToProduct(selectedProductId, {
          date: new Date().toISOString().slice(0, 10),
          quantity: rowQty,
          pricePerUnit: rowPrice,
          totalCost: rowSubtotal,
          note: note.trim() || 'Добавлено через калькулятор',
        });
      } else {
        // Create new product in catalog with initial batch
        onAddNewProduct({
          name: productName.trim(),
          category: 'Общее',
          unit: unit.trim() || 'шт',
          initialBatch: {
            quantity: rowQty,
            price: rowPrice,
            note: note.trim() || 'Создано через калькулятор',
          },
        });
      }
    }

    // Reset inputs for next item
    setProductName('');
    setSelectedProductId(null);
    setQuantity('10');
    setNote('');
    nameInputRef.current?.focus();
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Clear all
  const handleClearAll = () => {
    if (items.length > 0 && confirm('Очистить текущий расчет?')) {
      setItems([]);
    }
  };

  // Save calculation to permanent history
  const handleSaveCalculation = () => {
    if (items.length === 0) return;

    const record: CalculationRecord = {
      id: 'calc-' + Date.now(),
      title: calcTitle.trim() || `Расчет ${new Date().toLocaleDateString('ru-RU')}`,
      date: new Date().toISOString().slice(0, 10),
      items: [...items],
      totalAmount,
      totalQuantity,
      notes: calcNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveCalculation(record);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Copy receipt text (for WhatsApp or messenger)
  const handleCopyReceipt = () => {
    const lines = [
      `🛒 ${calcTitle}`,
      `Дата: ${new Date().toLocaleDateString('ru-RU')}`,
      `---------------------------------`,
      ...items.map(
        (it, idx) =>
          `${idx + 1}. ${it.name}\n   ${it.quantity} ${it.unit} x ${formatCurrency(it.pricePerUnit, currency)} = ${formatCurrency(it.total, currency)}${it.note ? ` (${it.note})` : ''}`
      ),
      `---------------------------------`,
      `ИТОГО К ОПЛАТЕ: ${formatCurrency(totalAmount, currency)}`,
      `Всего позиций: ${items.length} | Количество: ${formatNumber(totalQuantity)} ед.`,
      `Wynn's Jyrgal & Gulnura`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Explanation of Multi-Price Logic */}
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-950">
                Автоматический расчет расходов с учетом разных цен
              </h2>
              <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-0.5">
                Вы можете добавлять один и тот же товар с разными ценами (например: <strong>10 яиц по 100 {currency}</strong> вчера и <strong>10 яиц по 110 {currency}</strong> сегодня). Программа точно считает сумму каждой партии и находит средневзвешенную цену!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-amber-300/80 text-amber-900 shadow-2xs">
              Партионный учет (FIFO)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Entry Form (Left) & Grand Summary / List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Entry Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Ввод товара и цены
                </h3>
              </div>
              <span className="text-xs text-slate-400">Быстрый ввод (Enter)</span>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              
              {/* Product Name Input with Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Наименование товара:
                </label>
                <div className="relative">
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      setSelectedProductId(null);
                    }}
                    placeholder="Например: Яйца куриные С0, Масло..."
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-colors"
                  />
                  {selectedProduct && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Из каталога
                    </span>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {filteredProductSuggestions.length > 0 && !selectedProductId && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 bg-slate-50 text-2xs font-bold text-slate-500 uppercase tracking-wider">
                      Выберите товар из каталога:
                    </div>
                    {filteredProductSuggestions.map((p) => {
                      const m = getProductMetrics(p);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          className="w-full text-left px-3.5 py-2 hover:bg-amber-50 flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{p.name}</span>
                            <span className="text-slate-400 ml-1.5">({p.category})</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-700 font-bold">
                              {formatCurrency(m.latestPrice, currency)} / {p.unit}
                            </span>
                            <span className="text-2xs text-slate-500 block">
                              остаток: {m.totalQuantity} {p.unit}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Existing Product info badge if selected */}
              {selectedProduct && selectedMetrics && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1 text-emerald-950">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Текущий остаток: {selectedMetrics.totalQuantity} {selectedProduct.unit}</span>
                    <span className="text-emerald-800 font-bold">{formatCurrency(selectedMetrics.totalCost, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-2xs">
                    <span>Средняя цена: {formatCurrency(selectedMetrics.averagePrice, currency)}</span>
                    <span>Последняя цена: {formatCurrency(selectedMetrics.latestPrice, currency)}</span>
                  </div>
                </div>
              )}

              {/* Quantity, Unit & Price */}
              <div className="grid grid-cols-12 gap-3">
                
                {/* Quantity */}
                <div className="col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Кол-во:
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Unit */}
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ед. изм.:
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-2 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Цена ({currency}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="100"
                    className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

              </div>

              {/* Optional Note / Batch Tag */}
              <div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Примечание к партии (например: свежий завоз, ферма...)"
                  className="w-full text-xs text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Instant Row Subtotal Banner */}
              <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <div>
                  <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider block">
                    Сумма позиции:
                  </span>
                  <span className="text-xs text-amber-900">
                    {rowQty} {unit} × {rowPrice} {currency}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-950">
                    {formatCurrency(rowSubtotal, currency)}
                  </span>
                </div>
              </div>

              {/* Sync to Catalog Checkbox */}
              <label className="flex items-center space-x-2 text-xs text-slate-700 font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={syncToCatalog}
                  onChange={(e) => setSyncToCatalog(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                />
                <span>Сохранять партию в каталог товаров с историей цен</span>
              </label>

              {/* Add Button */}
              <button
                type="submit"
                disabled={!productName.trim() || rowQty <= 0}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Добавить в расчет</span>
              </button>

            </form>

          </div>
        </div>

        {/* Right Column: Calculation Table & Grand Total Summary */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Grand Total Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Итоговая сумма расходов:
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight mt-1">
                  {formatCurrency(totalAmount, currency)}
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col items-end gap-2 text-xs text-slate-300">
                <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  Всего позиций: <strong className="text-white font-bold">{items.length}</strong>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  Всего единиц: <strong className="text-white font-bold">{formatNumber(totalQuantity)}</strong>
                </div>
                {totalQuantity > 0 && (
                  <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                    Средняя цена: <strong className="text-white font-bold">{formatCurrency(averageUnitCost, currency)} / ед.</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-700/60">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveCalculation}
                  disabled={items.length === 0}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all disabled:opacity-40"
                >
                  <Save className="w-4 h-4" />
                  <span>{savedSuccess ? 'Сохранено в историю!' : 'Сохранить расчет'}</span>
                </button>

                <button
                  onClick={handleCopyReceipt}
                  disabled={items.length === 0}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-40"
                  title="Скопировать чек для отправки в WhatsApp"
                >
                  {copiedReceipt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReceipt ? 'Скопировано!' : 'Копировать чек'}</span>
                </button>
              </div>

              {items.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 p-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистить расчет</span>
                </button>
              )}
            </div>
          </div>

          {/* Table of items in current calculation */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-800 text-sm">
                  Список товаров в расчете ({items.length})
                </h4>
              </div>
              <input
                type="text"
                value={calcTitle}
                onChange={(e) => setCalcTitle(e.target.value)}
                placeholder="Название расчета"
                className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1 w-48 sm:w-64 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                  <Calculator className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-slate-800 text-sm">
                  В расчете пока нет товаров
                </h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Введите наименование, количество и цену в форме слева, чтобы начать расчет расходов.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-2xs">
                    <tr>
                      <th className="p-3 pl-4">№</th>
                      <th className="p-3">Товар / Партия</th>
                      <th className="p-3 text-center">Кол-во</th>
                      <th className="p-3 text-right">Цена за ед.</th>
                      <th className="p-3 text-right font-bold text-slate-900">Сумма</th>
                      <th className="p-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-4 text-slate-400 font-mono text-2xs">
                          {idx + 1}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{it.name}</div>
                          {it.note && (
                            <div className="text-2xs text-slate-500 italic mt-0.5">
                              {it.note}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center font-medium">
                          <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800">
                            {it.quantity} {it.unit}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-medium text-slate-700">
                          {formatCurrency(it.pricePerUnit, currency)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(it.total, currency)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(it.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                            title="Удалить позицию"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 border-t border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={2} className="p-3 pl-4 text-xs uppercase tracking-wider text-slate-500">
                        Всего позиций: {items.length}
                      </td>
                      <td className="p-3 text-center text-xs text-slate-700">
                        {formatNumber(totalQuantity)} ед.
                      </td>
                      <td className="p-3 text-right text-xs text-slate-500">
                        Итого:
                      </td>
                      <td className="p-3 text-right text-sm sm:text-base font-black text-amber-700">
                        {formatCurrency(totalAmount, currency)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
