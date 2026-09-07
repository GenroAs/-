import React, { useState, useMemo } from 'react';
import { X, Plus, Calendar, TrendingUp, TrendingDown, Layers, CheckCircle2 } from 'lucide-react';
import { Product, Batch } from '../types';
import { formatCurrency, getProductMetrics } from '../utils/calc';

interface BatchAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddBatch: (productId: string, batchData: Omit<Batch, 'id' | 'productId' | 'createdAt'>) => void;
  currency: string;
}

export const BatchAddModal: React.FC<BatchAddModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddBatch,
  currency,
}) => {
  if (!isOpen || !product) return null;

  const currentMetrics = useMemo(() => getProductMetrics(product), [product]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [quantity, setQuantity] = useState<string>('10');
  const [price, setPrice] = useState<string>(
    currentMetrics.latestPrice > 0 ? String(currentMetrics.latestPrice) : '100'
  );
  const [date, setDate] = useState<string>(todayStr);
  const [supplier, setSupplier] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const numQty = parseFloat(quantity) || 0;
  const numPrice = parseFloat(price) || 0;
  const batchTotal = numQty * numPrice;

  // New simulated totals
  const newTotalQty = currentMetrics.totalQuantity + numQty;
  const newTotalCost = currentMetrics.totalCost + batchTotal;
  const newAveragePrice = newTotalQty > 0 ? newTotalCost / newTotalQty : 0;
  const priceDiff = currentMetrics.latestPrice > 0 ? numPrice - currentMetrics.latestPrice : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) return;

    onAddBatch(product.id, {
      date: date || todayStr,
      quantity: numQty,
      pricePerUnit: numPrice,
      totalCost: batchTotal,
      supplier: supplier.trim() || undefined,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-snug">
                Добавить новую партию товара
              </h3>
              <p className="text-xs text-emerald-100 line-clamp-1">
                {product.name} ({product.unit})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Current State Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between font-semibold text-slate-800 text-sm">
              <span>Текущий остаток и партии:</span>
              <span className="text-emerald-700">
                {currentMetrics.totalQuantity} {product.unit} = {formatCurrency(currentMetrics.totalCost, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Средневзвешенная цена:</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(currentMetrics.averagePrice, currency)} / {product.unit}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Предыдущая цена закупки:</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(currentMetrics.latestPrice, currency)} / {product.unit}
              </span>
            </div>
          </div>

          {/* Inputs: Quantity & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Количество ({product.unit}):
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="w-full text-base font-semibold text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Цена за 1 {product.unit} ({currency}):
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="110"
                className="w-full text-base font-semibold text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Date & Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Дата поступления:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Поставщик (опционально):
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Например, Оптовик"
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Примечание к партии:
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например, свежая партия по новой цене"
              className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Live Mathematical Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                Сумма этой партии:
              </span>
              <span className="text-base font-bold text-emerald-800">
                {formatCurrency(batchTotal, currency)}
              </span>
            </div>

            <div className="border-t border-emerald-200/60 pt-2 space-y-1 text-xs text-emerald-950">
              <div className="flex items-center justify-between">
                <span>Итого после добавления:</span>
                <span className="font-bold">
                  {newTotalQty} {product.unit} на сумму {formatCurrency(newTotalCost, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Новая средняя цена:</span>
                <span className="font-bold">
                  {formatCurrency(newAveragePrice, currency)} / {product.unit}
                </span>
              </div>
              {currentMetrics.latestPrice > 0 && priceDiff !== 0 && (
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center space-x-1">
                    {priceDiff > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                    )}
                    <span>Изменение цены закупки:</span>
                  </span>
                  <span className={`font-semibold ${priceDiff > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                    {priceDiff > 0 ? `+${priceDiff}` : priceDiff} {currency} ({Math.round((priceDiff / currentMetrics.latestPrice) * 100)}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={numQty <= 0}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              Сохранить партию
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
