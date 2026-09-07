import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Product, CalculationRecord } from '../types';
import {
  exportDataToExcel,
  downloadSampleTemplate,
  parseExcelFile,
  mergeImportedRowsToProducts,
  ImportedRow,
} from '../utils/excel';

interface ExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  calculations: CalculationRecord[];
  currency: string;
  onImportComplete: (updatedProducts: Product[]) => void;
}

export const ExcelModal: React.FC<ExcelModalProps> = ({
  isOpen,
  onClose,
  products,
  calculations,
  currency,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importRows, setImportRows] = useState<ImportedRow[] | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDataToExcel(products, calculations, currency);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg(null);
    setFileName(file.name);

    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        setErrorMsg('В файле не найдено строк с товарами или наименованиями.');
        setImportRows(null);
      } else {
        setImportRows(rows);
      }
    } catch (err: any) {
      console.error('Excel parse error:', err);
      setErrorMsg('Не удалось прочитать файл Excel. Убедитесь, что это корректный .xlsx, .xls или .csv файл.');
      setImportRows(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyImport = () => {
    if (!importRows || importRows.length === 0) return;

    const merged = mergeImportedRowsToProducts(products, importRows, importMode);
    onImportComplete(merged);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-snug">
                Экспорт и импорт через Excel
              </h3>
              <p className="text-xs text-emerald-100">
                Wynn's Jyrgal &amp; Gulnura
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Экспорт в Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center space-x-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Импорт из Excel</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-5">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-950 space-y-2">
                <div className="font-semibold text-emerald-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>В формируемую таблицу Excel будут выгружены 3 подробных листа:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-emerald-900/90 pl-1">
                  <li><strong>Товары и итоги</strong>: список всех {products.length} товаров с общими остатками, суммами и средневзвешенными ценами.</li>
                  <li><strong>История изменений цен</strong>: полная детальная хронология всех закупочных партий с датами и ценами.</li>
                  <li><strong>История расчетов</strong>: сохраненные чеки и расчеты расходов ({calculations.length} записей).</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={downloadSampleTemplate}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Скачать пустой шаблон (.xlsx)</span>
                </button>

                <button
                  onClick={handleExport}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>Выгрузить отчет в Excel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* File upload drag/click box */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {fileName ? fileName : 'Нажмите, чтобы выбрать файл Excel (.xlsx, .xls, .csv)'}
                </p>
                <p className="text-xs text-slate-500">
                  Поддерживаются файлы со столбцами: Наименование, Количество, Цена, Ед. изм., Дата
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Preview table if rows parsed */}
              {importRows && importRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Распознано товаров и партий: {importRows.length}</span>
                    <button
                      onClick={downloadSampleTemplate}
                      className="text-emerald-700 hover:underline"
                    >
                      Скачать шаблон
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="min-w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                        <tr>
                          <th className="p-2">Товар</th>
                          <th className="p-2">Кол-во</th>
                          <th className="p-2">Цена</th>
                          <th className="p-2">Категория</th>
                          <th className="p-2">Дата</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {importRows.slice(0, 8).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-medium">{r.name}</td>
                            <td className="p-2">{r.quantity} {r.unit}</td>
                            <td className="p-2 font-semibold text-emerald-800">{r.price} {currency}</td>
                            <td className="p-2 text-slate-500">{r.category}</td>
                            <td className="p-2 text-slate-500">{r.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importRows.length > 8 && (
                    <p className="text-xs text-slate-500 italic">
                      ... и ещё {importRows.length - 8} строк
                    </p>
                  )}

                  {/* Mode options */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-emerald-600"
                      />
                      <span>Дополнить существующие товары (добавить новые партии к имеющимся)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-emerald-600"
                      />
                      <span className="text-red-700">Заменить каталог полностью новыми данными из Excel</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  disabled={!importRows || importRows.length === 0}
                  onClick={handleApplyImport}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  Применить импорт ({importRows ? importRows.length : 0} поз.)
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
