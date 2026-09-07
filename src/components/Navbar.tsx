import React from 'react';
import {
  Calculator,
  Package,
  History,
  FileSpreadsheet,
  Smartphone,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { CURRENCIES } from '../types';

interface NavbarProps {
  activeTab: 'calculator' | 'products' | 'history';
  setActiveTab: (tab: 'calculator' | 'products' | 'history') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  onOpenExcelModal: () => void;
  onOpenResetModal: () => void;
  productsCount: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenExcelModal,
  onOpenResetModal,
  productsCount,
  historyCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-sm ring-1 ring-amber-500/20">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-xl tracking-tight text-slate-900">
                  Wynn's
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                  Jyrgal &amp; Gulnura
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Калькулятор партий и цен • Автономно на вашем устройстве
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
            <button
              id="nav-tab-calculator"
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'calculator'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-600" />
              <span>Калькулятор</span>
            </button>

            <button
              id="nav-tab-products"
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Товары &amp; Цены</span>
              {productsCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                  {productsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>История расчетов</span>
              {historyCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right actions: Currency, Device badge, Clean slate, Excel */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Currency selector */}
            <div className="relative">
              <select
                id="currency-selector"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg pl-2.5 pr-7 py-2 cursor-pointer transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.symbol}>
                    {c.symbol} {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Offline Device indicator badge */}
            <div
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
              title="Данные хранятся изолированно только на этом устройстве. У каждого телефона своя отдельная база."
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>На этом устройстве</span>
            </div>

            {/* Excel Import/Export */}
            <button
              id="btn-excel-actions"
              onClick={onOpenExcelModal}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 stroke-[2]" />
              <span className="hidden sm:inline font-semibold">Excel</span>
            </button>

            {/* Reset All Products with Captcha */}
            {productsCount > 0 && (
              <button
                id="btn-open-reset-modal"
                onClick={onOpenResetModal}
                title="Сбросить все товары с подтверждением защитным кодом"
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Сбросить товары</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 flex flex-col items-center py-1 text-xs font-medium ${
              activeTab === 'calculator' ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Calculator className="w-4 h-4 mb-0.5" />
            <span>Калькулятор</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex flex-col items-center py-1 text-xs font-medium ${
              activeTab === 'products' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Package className="w-4 h-4 mb-0.5" />
            <span>Товары ({productsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex flex-col items-center py-1 text-xs font-medium ${
              activeTab === 'history' ? 'text-indigo-700 font-bold' : 'text-slate-500'
            }`}
          >
            <History className="w-4 h-4 mb-0.5" />
            <span>История ({historyCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
