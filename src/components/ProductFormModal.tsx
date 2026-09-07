import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Edit2 } from 'lucide-react';
import { Product, COMMON_UNITS } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSaveProduct: (productData: {
    name: string;
    category: string;
    unit: string;
    initialBatch?: {
      quantity: number;
      price: number;
      date?: string;
      supplier?: string;
      note?: string;
    };
  }) => void;
  currency: string;
  existingCategories?: string[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  currency,
  existingCategories = [],
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Продукты питания');
  const [unit, setUnit] = useState('шт');

  // Initial batch for new products
  const [hasInitialBatch, setHasInitialBatch] = useState(true);
  const [quantity, setQuantity] = useState('10');
  const [price, setPrice] = useState('100');
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category || 'Продукты питания');
      setUnit(productToEdit.unit || 'шт');
      setHasInitialBatch(false);
    } else {
      setName('');
      setCategory('Продукты питания');
      setUnit('шт');
      setHasInitialBatch(true);
      setQuantity('10');
      setPrice('100');
      setSupplier('');
      setNote('');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveProduct({
      name: name.trim(),
      category: category.trim() || 'Общее',
      unit: unit.trim() || 'шт',
      initialBatch: !productToEdit && hasInitialBatch && parseFloat(quantity) > 0 ? {
        quantity: parseFloat(quantity) || 1,
        price: parseFloat(price) || 0,
        supplier: supplier.trim() || undefined,
        note: note.trim() || undefined,
      } : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              {productToEdit ? <Edit2 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-base leading-snug">
                {productToEdit ? 'Редактировать товар' : 'Новый товар в каталоге'}
              </h3>
              <p className="text-xs text-slate-300">
                Wynn's Jyrgal &amp; Gulnura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Наименование товара:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Яйца куриные С0, Масло Wynn's..."
              className="w-full text-sm font-semibold text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Категория:
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Продукты, Автохимия..."
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <datalist id="category-suggestions">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {existingCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {existingCategories.slice(0, 5).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`text-2xs px-2 py-0.5 rounded-md border transition-colors ${
                        category === c
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Единица измерения:
              </label>
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="шт"
                  className="w-20 text-xs font-medium text-slate-800 border border-slate-300 rounded-xl px-2.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 cursor-pointer"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Initial Batch Section (only for new products) */}
          {!productToEdit && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInitialBatch}
                    onChange={(e) => setHasInitialBatch(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Сразу внести первую партию товара
                  </span>
                </label>
              </div>

              {hasInitialBatch && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Количество ({unit}):
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full text-sm font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Цена за ед. ({currency}):
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full text-sm font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Поставщик:
                      </label>
                      <input
                        type="text"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        placeholder="Опт / Рынок"
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Примечание:
                      </label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Закупка..."
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 pt-1 border-t border-slate-200/60">
                    <span>Сумма первой партии:</span>
                    <span className="text-amber-700">
                      {((parseFloat(quantity) || 0) * (parseFloat(price) || 0)).toLocaleString('ru-RU')} {currency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {productToEdit ? 'Сохранить изменения' : 'Создать товар'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
