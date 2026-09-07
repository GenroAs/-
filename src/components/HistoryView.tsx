import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  DollarSign,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { CalculationRecord, CalculationItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/calc';

interface HistoryViewProps {
  calculations: CalculationRecord[];
  currency: string;
  onLoadIntoCalculator: (items: CalculationItem[], title: string) => void;
  onDeleteCalculation: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  calculations,
  currency,
  onLoadIntoCalculator,
  onDeleteCalculation,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalCalculationsSum = useMemo(() => {
    return calculations.reduce((sum, c) => sum + c.totalAmount, 0);
  }, [calculations]);

  const filteredCalculations = useMemo(() => {
    return calculations.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchItem = c.items.some((it) => it.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchTitle || matchItem;
    });
  }, [calculations, searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyReceipt = (calc: CalculationRecord) => {
    const lines = [
      `🛒 ${calc.title}`,
      `Дата: ${calc.date || calc.createdAt.slice(0, 10)}`,
      `---------------------------------`,
      ...calc.items.map(
        (it, idx) =>
          `${idx + 1}. ${it.name}\n   ${it.quantity} ${it.unit} x ${formatCurrency(it.pricePerUnit, currency)} = ${formatCurrency(it.total, currency)}`
      ),
      `---------------------------------`,
      `ИТОГО: ${formatCurrency(calc.totalAmount, currency)}`,
      `Позиций: ${calc.items.length} | Wynn's Jyrgal & Gulnura`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedId(calc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Всего расчетов в истории:
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {calculations.length}
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            Сохраненных чеков и калькуляций
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Сумма всех сохраненных расчетов:
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {formatCurrency(totalCalculationsSum, currency)}
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            Общая сумма по всем зафиксированным расходным сессиям
          </p>
        </div>

      </div>

      {/* Filter and Clear history */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию расчета или товару..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        {calculations.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Очистить всю историю сохраненных расчетов?')) {
                onClearHistory();
              }
            }}
            className="flex items-center justify-center space-x-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить историю</span>
          </button>
        )}
      </div>

      {/* Calculations List */}
      {filteredCalculations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            {searchTerm ? 'Расчеты не найдены' : 'История расчетов пуста'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? 'Попробуйте изменить поисковый запрос.'
              : 'Вы можете рассчитать товары во вкладке «Калькулятор» и нажать кнопку «Сохранить расчет», чтобы зафиксировать чек.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCalculations.map((calc) => {
            const isExpanded = !!expandedIds[calc.id];

            return (
              <div
                key={calc.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <h4 className="font-bold text-base text-slate-900">
                        {calc.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{calc.date || calc.createdAt.slice(0, 10)}</span>
                      </span>
                      <span>•</span>
                      <span>Позиций: <strong>{calc.items.length}</strong></span>
                      <span>•</span>
                      <span>Единиц: <strong>{formatNumber(calc.totalQuantity)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div className="text-right">
                      <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                        Итого:
                      </span>
                      <span className="text-lg sm:text-xl font-black text-amber-700">
                        {formatCurrency(calc.totalAmount, currency)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onLoadIntoCalculator(calc.items, calc.title)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 transition-colors"
                        title="Загрузить позиции в калькулятор для повторного расчета"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">В калькулятор</span>
                      </button>

                      <button
                        onClick={() => handleCopyReceipt(calc)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Скопировать чек"
                      >
                        {copiedId === calc.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Удалить расчет "${calc.title}"?`)) {
                            onDeleteCalculation(calc.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Удалить из истории"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(calc.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title={isExpanded ? 'Скрыть детали' : 'Показать товары'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Expanded Details Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold text-2xs uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5 pl-3">№</th>
                            <th className="p-2.5">Товар</th>
                            <th className="p-2.5 text-center">Кол-во</th>
                            <th className="p-2.5 text-right">Цена за ед.</th>
                            <th className="p-2.5 text-right font-bold text-slate-900">Сумма</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {calc.items.map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td className="p-2.5 pl-3 font-mono text-slate-400 text-2xs">
                                {idx + 1}
                              </td>
                              <td className="p-2.5 font-medium text-slate-900">
                                {it.name}
                                {it.note && (
                                  <span className="text-slate-400 text-2xs block">
                                    {it.note}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-center">
                                {it.quantity} {it.unit}
                              </td>
                              <td className="p-2.5 text-right font-mono">
                                {formatCurrency(it.pricePerUnit, currency)}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                {formatCurrency(it.total, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                          <tr>
                            <td colSpan={2} className="p-2.5 pl-3 text-slate-500 uppercase text-2xs">
                              Всего:
                            </td>
                            <td className="p-2.5 text-center text-slate-800">
                              {formatNumber(calc.totalQuantity)} ед.
                            </td>
                            <td className="p-2.5 text-right text-slate-500">
                              Итоговая сумма:
                            </td>
                            <td className="p-2.5 text-right text-amber-800 font-black">
                              {formatCurrency(calc.totalAmount, currency)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
