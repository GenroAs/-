import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator,
  Plus,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { Product, COMMON_UNITS } from '../types';
import { formatCurrency, getProductMetrics } from '../utils/calc';

interface CalculatorViewProps {
  products: Product[];
  currency: string;
  onAddNewBatchToProduct: (productId: string, batchData: any) => void;
  onAddNewProduct: (productData: any) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  products,
  currency,
  onAddNewBatchToProduct,
  onAddNewProduct,
}) => {
  // Inputs
  const [productName, setProductName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('шт');
  const [note, setNote] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Autocomplete suggestions
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

  // Autocomplete selection
  const handleSelectProduct = (p: Product) => {
    setSelectedProductId(p.id);
    setProductName(p.name);
    setUnit(p.unit || 'шт');
    const m = getProductMetrics(p);
    if (m.latestPrice > 0) {
      setPrice(String(m.latestPrice));
    }
  };

  // Instant calculated preview
  const rowQty = parseFloat(quantity) || 0;
  const rowPrice = parseFloat(price) || 0;
  const rowSubtotal = rowQty * rowPrice;

  // Add current row to catalog
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = productName.trim();
    if (!trimmedName || rowQty <= 0) return;

    // Check if product exists by selectedProductId or by exact name match (case-insensitive)
    const existingProduct = selectedProductId
      ? products.find((p) => p.id === selectedProductId)
      : products.find((p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase());

    if (existingProduct) {
      onAddNewBatchToProduct(existingProduct.id, {
        date: new Date().toISOString().slice(0, 10),
        quantity: rowQty,
        pricePerUnit: rowPrice,
        totalCost: rowSubtotal,
        note: note.trim() || 'Добавлено через калькулятор',
      });
      setSavedFeedback(
        `Новая партия «${existingProduct.name}» с актуальной ценой ${formatCurrency(rowPrice, currency)} сохранена!`
      );
    } else {
      onAddNewProduct({
        name: trimmedName,
        category: 'Общее',
        unit: unit.trim() || 'шт',
        initialBatch: {
          quantity: rowQty,
          price: rowPrice,
          note: note.trim() || 'Создано через калькулятор',
        },
      });
      setSavedFeedback(`Товар «${trimmedName}» с ценой ${formatCurrency(rowPrice, currency)} сохранен в каталог!`);
    }

    // Reset inputs
    setProductName('');
    setSelectedProductId(null);
    setQuantity('1');
    setPrice('');
    setNote('');
    nameInputRef.current?.focus();

    setTimeout(() => {
      setSavedFeedback(null);
    }, 3500);
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      
      {/* Success notification */}
      {savedFeedback && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2.5 text-emerald-900 text-xs sm:text-sm font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Main Single Block: Ввод товара и цены */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Ввод товара и цены
              </h3>
              <p className="text-xs text-slate-500">
                Быстрый расчет суммы и сохранение в базу товаров
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddItem} className="space-y-4">
          
          {/* Product Name Input with Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                placeholder="Например: Саморезы 35мм, Кирпич, Краска..."
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-colors"
              />
              {selectedProduct && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Package className="w-3 h-3" />
                  <span>В каталоге</span>
                </span>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {filteredProductSuggestions.length > 0 && !selectedProductId && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 bg-slate-50 text-2xs font-bold text-slate-500 uppercase tracking-wider">
                  Выберите товар из каталога:
                </div>
                {filteredProductSuggestions.map((p) => {
                  const m = getProductMetrics(p);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        {p.category && <span className="text-slate-400 ml-1.5">({p.category})</span>}
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

          {/* Catalog badge if selected */}
          {selectedProduct && selectedMetrics && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
              <div className="flex items-center justify-between font-semibold">
                <span>Остаток на складе: {selectedMetrics.totalQuantity} {selectedProduct.unit}</span>
                <span className="text-emerald-800 font-bold">{formatCurrency(selectedMetrics.totalCost, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 text-2xs">
                <span>Средняя цена: {formatCurrency(selectedMetrics.averagePrice, currency)}</span>
                <span>Последняя цена: {formatCurrency(selectedMetrics.latestPrice, currency)}</span>
              </div>
            </div>
          )}

          {/* Quantity, Unit & Price */}
          <div className="grid grid-cols-12 gap-3 pt-1">
            
            {/* Quantity */}
            <div className="col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Кол-во:
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 text-center focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Unit */}
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ед. изм.:
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-2 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Цена ({currency}):
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 text-center focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

          </div>

          {/* Optional Note */}
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Примечание к партии (поставщик, сорт, комментарий...)"
              className="w-full text-xs text-slate-700 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Instant Subtotal Calculation */}
          <div className="flex items-center justify-between p-4 bg-amber-50/80 border border-amber-200/90 rounded-xl">
            <div>
              <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider block">
                Сумма позиции:
              </span>
              <span className="text-xs text-amber-900 mt-0.5 block">
                {rowQty} {unit} × {rowPrice} {currency}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-amber-950">
                {formatCurrency(rowSubtotal, currency)}
              </span>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={!productName.trim() || rowQty <= 0}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Сохранить товар в каталог</span>
          </button>

        </form>

      </div>

    </div>
  );
};
