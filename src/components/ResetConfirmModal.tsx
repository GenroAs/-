import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  RefreshCw,
  Package,
  Coins,
  Layers,
} from 'lucide-react';

export type ResetMode = 'all' | 'quantities' | 'prices';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (mode: ResetMode) => void;
  productsCount: number;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  productsCount,
}) => {
  const [selectedMode, setSelectedMode] = useState<ResetMode>('quantities');
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Generate a random 4-digit numeric code whenever modal opens
  const generateNewCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setUserInput('');
    setErrorMsg('');
  };

  useEffect(() => {
    if (isOpen) {
      generateNewCode();
      setSelectedMode('quantities');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = userInput.trim() === captchaCode;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched) {
      setErrorMsg('Неверный код подтверждения. Введите 4 цифры с картинки.');
      return;
    }
    onConfirmReset(selectedMode);
    onClose();
  };

  const getModeDetails = () => {
    switch (selectedMode) {
      case 'quantities':
        return {
          title: 'Обнулить количество (остатки)',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
          warnBg: 'bg-amber-50/90 border-amber-200 text-amber-950',
          bulletList: [
            `Остатки всех ${productsCount} товаров будут установлены в 0 шт.`,
            'Наименования товаров, категории и закупочные цены сохранятся.',
            'Удобно использовать для проведения новой инвентаризации склада.',
          ],
          btnText: 'Обнулить остатки всех товаров',
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'prices':
        return {
          title: 'Обнулить только цены',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
          warnBg: 'bg-blue-50/90 border-blue-200 text-blue-950',
          bulletList: [
            `Цены всех ${productsCount} товаров будут установлены в 0 ₽.`,
            'Наименования товаров и текущие остатки на складе сохранятся.',
            'Удобно перед массовой переоценкой или импортом нового прайса.',
          ],
          btnText: 'Обнулить цены всех товаров',
          btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      case 'all':
      default:
        return {
          title: 'Сбросить всё (полная очистка)',
          badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
          warnBg: 'bg-rose-50/90 border-rose-200 text-rose-950',
          bulletList: [
            `Все товары в каталоге (${productsCount} шт.) будут полностью удалены.`,
            'Все партии, история поставок и расчетов будут стёрты.',
            'База данных вернётся в полностью пустое состояние.',
          ],
          btnText: 'Стереть все товары и базу',
          btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
        };
    }
  };

  const currentDetails = getModeDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Сброс товаров и данных
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Выберите, что именно вы хотите сбросить
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Reset Mode Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Вариант сброса:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Option 1: Quantity */}
            <button
              type="button"
              onClick={() => {
                setSelectedMode('quantities');
                setErrorMsg('');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                selectedMode === 'quantities'
                  ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center space-x-2 text-amber-800 mb-1.5">
                <Layers className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs">Количество</span>
              </div>
              <p className="text-2xs text-slate-500 leading-tight">
                Обнулить остатки (0 шт). Цены и товары остаются.
              </p>
            </button>

            {/* Option 2: Price */}
            <button
              type="button"
              onClick={() => {
                setSelectedMode('prices');
                setErrorMsg('');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                selectedMode === 'prices'
                  ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center space-x-2 text-blue-800 mb-1.5">
                <Coins className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs">Цены</span>
              </div>
              <p className="text-2xs text-slate-500 leading-tight">
                Обнулить цены (0 ₽). Товары и остатки остаются.
              </p>
            </button>

            {/* Option 3: All */}
            <button
              type="button"
              onClick={() => {
                setSelectedMode('all');
                setErrorMsg('');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                selectedMode === 'all'
                  ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center space-x-2 text-rose-800 mb-1.5">
                <Trash2 className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs">Всё сразу</span>
              </div>
              <p className="text-2xs text-slate-500 leading-tight">
                Полная очистка: удалить все товары из каталога.
              </p>
            </button>
          </div>
        </div>

        {/* Informative details for selected mode */}
        <div className={`p-3.5 border rounded-xl text-xs space-y-1.5 leading-relaxed ${currentDetails.warnBg}`}>
          <div className="font-bold flex items-center space-x-1.5">
            <span>{currentDetails.title}:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-2xs sm:text-xs">
            {currentDetails.bulletList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Captcha Security Protection */}
        <form onSubmit={handleConfirm} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Для защиты от случайного нажатия введите защитный код:
            </label>

            {/* Visual Captcha Display */}
            <div className="flex items-center justify-between p-3 bg-slate-100 border border-slate-300 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Код:</span>
                <span className="font-mono text-2xl font-black tracking-widest text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 select-all shadow-2xs">
                  {captchaCode}
                </span>
              </div>
              <button
                type="button"
                onClick={generateNewCode}
                title="Обновить защитный код"
                className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Новый код</span>
              </button>
            </div>

            {/* Input field */}
            <div className="mt-2.5">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={`Введите ${captchaCode}`}
                className="w-full text-center font-mono text-xl font-bold text-slate-900 tracking-widest border border-slate-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium mt-1.5 text-center">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!isMatched}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isMatched
                  ? `${currentDetails.btnClass} cursor-pointer active:scale-98`
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              {selectedMode === 'all' ? (
                <Trash2 className="w-4 h-4" />
              ) : selectedMode === 'prices' ? (
                <Coins className="w-4 h-4" />
              ) : (
                <Layers className="w-4 h-4" />
              )}
              <span>{currentDetails.btnText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
