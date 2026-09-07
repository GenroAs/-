import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Layers,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Tag,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HardDrive,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, formatNumber, getProductMetrics } from '../utils/calc';
import { getStorageUsage } from '../utils/demo';

interface ProductsViewProps {
  products: Product[];
  currency: string;
  onOpenNewProductModal: () => void;
  onOpenEditProductModal: (product: Product) => void;
  onOpenAddBatchModal: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onDeleteBatch: (productId: string, batchId: string) => void;
  onGenerate1000Demo?: () => void;
  onClearDemo?: () => void;
  hasDemoProducts?: boolean;
}

type SortOption =
  | 'updated-desc'
  | 'name-asc'
  | 'name-desc'
  | 'cost-desc'
  | 'cost-asc'
  | 'qty-desc'
  | 'price-desc';

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  currency,
  onOpenNewProductModal,
  onOpenEditProductModal,
  onOpenAddBatchModal,
  onDeleteProduct,
  onDeleteBatch,
  onGenerate1000Demo,
  onClearDemo,
  hasDemoProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({
    'prod-eggs': true, // Auto-expand sample eggs product to show batch history
  });

  // Calculate storage usage metrics
  const storageInfo = useMemo(() => {
    return getStorageUsage(products);
  }, [products]);

  // Extract all categories and count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const cat = p.category || 'Без категории';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [products]);

  // Overall catalog metrics
  const overallMetrics = useMemo(() => {
    let totalValue = 0;
    let totalItemsCount = 0;
    let totalBatchesCount = 0;

    products.forEach((p) => {
      const m = getProductMetrics(p);
      totalValue += m.totalCost;
      totalItemsCount += m.totalQuantity;
      totalBatchesCount += m.batchesCount;
    });

    return {
      totalValue,
      totalItemsCount,
      totalBatchesCount,
      productsCount: products.length,
    };
  }, [products]);

  // Reset pagination when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, pageSize, sortOption]);

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    
    // Step 1: Filter
    const list = products.filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.category && p.category.toLowerCase().includes(term));
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Step 2: Sort
    list.sort((a, b) => {
      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name, 'ru');
      }
      if (sortOption === 'name-desc') {
        return b.name.localeCompare(a.name, 'ru');
      }
      if (sortOption === 'cost-desc' || sortOption === 'cost-asc') {
        const costA = getProductMetrics(a).totalCost;
        const costB = getProductMetrics(b).totalCost;
        return sortOption === 'cost-desc' ? costB - costA : costA - costB;
      }
      if (sortOption === 'qty-desc') {
        const qtyA = getProductMetrics(a).totalQuantity;
        const qtyB = getProductMetrics(b).totalQuantity;
        return qtyB - qtyA;
      }
      if (sortOption === 'price-desc') {
        const prcA = getProductMetrics(a).latestPrice;
        const prcB = getProductMetrics(b).latestPrice;
        return prcB - prcA;
      }
      // default: updated-desc
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    return list;
  }, [products, searchTerm, selectedCategory, sortOption]);

  // Pagination slicing
  const totalFilteredCount = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [filteredAndSortedProducts, validCurrentPage, pageSize]);

  const toggleExpand = (id: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAllOnPage = () => {
    const next: Record<string, boolean> = {};
    paginatedProducts.forEach((p) => {
      next[p.id] = true;
    });
    setExpandedProductIds((prev) => ({ ...prev, ...next }));
  };

  const collapseAllOnPage = () => {
    setExpandedProductIds({});
  };

  // Generate page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validCurrentPage > 3) pages.push('...');
      const start = Math.max(2, validCurrentPage - 1);
      const end = Math.min(totalPages - 1, validCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (validCurrentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  }, [totalPages, validCurrentPage]);

  return (
    <div className="space-y-6">
      
      {/* 1000+ Items Capacity & Scale Info Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Zap className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                  Вместимость и масштабируемость: легко поддерживает более 10 000 товаров
                </h3>
                <span className="text-2xs font-black uppercase px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-900">
                  100% готов к нагрузке
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed mt-1">
                Приложение работает автономно на вашем устройстве: данные сохраняются мгновенно в памяти вашего телефона. На каждом устройстве база полностью изолирована (вы можете вести стройматериалы, а коллега на своём телефоне — косметику).
              </p>
              
              {/* Storage meter */}
              <div className="flex items-center space-x-3 mt-2.5 text-xs text-emerald-800">
                <div className="flex items-center space-x-1.5 font-medium">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Занято памяти: <strong>{storageInfo.formatted}</strong> из 5 000 КБ ({storageInfo.percentOfQuota}%)</span>
                </div>
                <span>•</span>
                <span>Товаров в базе: <strong>{products.length}</strong></span>
              </div>
            </div>
          </div>

          {/* Demonstration Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0 self-stretch md:self-auto justify-end">
            {hasDemoProducts ? (
              <button
                id="btn-clear-demo-products"
                onClick={onClearDemo}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-colors shadow-2xs"
                title="Удалить тестовую 1 000 товаров и вернуть ваш каталог"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить 1 000 демо-товаров</span>
              </button>
            ) : (
              <button
                id="btn-generate-1000-demo"
                onClick={onGenerate1000Demo}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-transform active:scale-[0.98]"
                title="Сгенерировать 1 000 реалистичных товаров для проверки скорости работы"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Загрузить 1 000 тестовых товаров</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Общая сумма расходов:
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(overallMetrics.totalValue, currency)}
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            Суммарная себестоимость всех партий
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Товаров в каталоге:
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {overallMetrics.productsCount}
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            Уникальных наименований
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Всего партий / поставок:
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {overallMetrics.totalBatchesCount}
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            Исторических записей цен
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Всего единиц товаров:
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatNumber(overallMetrics.totalItemsCount)}
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            Физический остаток всех позиций
          </p>
        </div>

      </div>

      {/* Action Bar: Search, Category Filter, Sorting, Expand & Add Product Button */}
      <div className="space-y-3">
        {/* Horizontal Category Badges Bar for 1-click category switching */}
        {categories.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Все категории ({categoryCounts['all'] || 0})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === c
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {c} ({categoryCounts[c] || 0})
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-products-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по названию или категории..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <select
                id="filter-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Все категории ({products.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Sort options */}
            <div className="relative shrink-0">
              <select
                id="sort-products-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full sm:w-auto bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
              >
                <option value="updated-desc">Сначала свежие</option>
                <option value="name-asc">По названию (А → Я)</option>
                <option value="name-desc">По названию (Я → А)</option>
                <option value="cost-desc">По сумме остатка (убывание)</option>
                <option value="cost-asc">По сумме остатка (возрастание)</option>
                <option value="qty-desc">По количеству (больше всего)</option>
                <option value="price-desc">По цене (дорогие)</option>
              </select>
            </div>
          </div>

          {/* Add Product Button */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              id="btn-new-product"
              onClick={onOpenNewProductModal}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Новый товар</span>
            </button>
          </div>

        </div>

        {/* Sub-bar: Pagination count, page size selector, expand/collapse toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 px-1">
          <div className="flex items-center space-x-3">
            <span>
              Показано <strong>{paginatedProducts.length}</strong> из{' '}
              <strong>{totalFilteredCount}</strong> товаров
              {searchTerm && ' (найдено по фильтру)'}
            </span>

            {/* Quick Expand/Collapse all on current page */}
            {paginatedProducts.length > 0 && (
              <div className="flex items-center space-x-2 border-l border-slate-300 pl-3">
                <button
                  onClick={expandAllOnPage}
                  className="text-amber-700 hover:underline font-semibold"
                >
                  Развернуть все
                </button>
                <span>/</span>
                <button
                  onClick={collapseAllOnPage}
                  className="text-slate-500 hover:underline"
                >
                  Свернуть
                </button>
              </div>
            )}
          </div>

          {/* Page size dropdown */}
          <div className="flex items-center space-x-2">
            <span>Строк на странице:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-2 py-1 focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List with Batches & Price History */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Товары не найдены</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? 'Попробуйте изменить поисковый запрос или сбросить фильтр категорий.'
              : 'В каталоге пока нет товаров. Добавьте первый товар, импортируйте через Excel или сгенерируйте 1 000 тестовых товаров.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedProducts.map((p) => {
            const metrics = getProductMetrics(p);
            const isExpanded = !!expandedProductIds[p.id];

            return (
              <div
                key={p.id}
                id={`product-card-${p.id}`}
                className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Product Card Header / Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">
                        {p.name}
                      </h3>
                      <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                        {p.category || 'Без категории'}
                      </span>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                        Ед: {p.unit}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2 flex-wrap gap-y-1">
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Партий: <strong>{metrics.batchesCount}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Обновлено: {new Date(p.updatedAt).toLocaleDateString('ru-RU')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Pricing Key Numbers */}
                  <div className="flex items-center justify-between sm:justify-end w-full lg:w-auto gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    
                    {/* Total Quantity */}
                    <div className="text-left sm:text-right">
                      <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                        Всего остаток:
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {formatNumber(metrics.totalQuantity)} {p.unit}
                      </span>
                    </div>

                    {/* Total Sum */}
                    <div className="text-left sm:text-right">
                      <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                        Общая сумма:
                      </span>
                      <span className="text-base sm:text-lg font-black text-emerald-700">
                        {formatCurrency(metrics.totalCost, currency)}
                      </span>
                    </div>

                    {/* Average Price */}
                    <div className="text-left sm:text-right">
                      <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                        Средняя цена:
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        {formatCurrency(metrics.averagePrice, currency)} / {p.unit}
                      </span>
                    </div>

                    {/* Actual Latest Price & Dynamics */}
                    <div className="text-left sm:text-right">
                      <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                        Актуальная цена:
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {formatCurrency(metrics.latestPrice, currency)}
                        </span>
                        {metrics.previousPrice !== null && metrics.priceChange !== 0 && (
                          <span
                            className={`text-2xs font-bold px-1.5 py-0.5 rounded-sm flex items-center ${
                              metrics.priceChange > 0
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                            title={`Изменение цены: ${metrics.priceChange > 0 ? '+' : ''}${metrics.priceChange} ${currency}`}
                          >
                            {metrics.priceChange > 0 ? (
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-0.5" />
                            )}
                            {metrics.priceChange > 0 ? '+' : ''}
                            {Math.round(metrics.priceChangePercent)}%
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                    <button
                      onClick={() => onOpenAddBatchModal(p)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-colors shadow-2xs"
                      title="Добавить партию по новой или старой цене"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Добавить партию</span>
                    </button>

                    <button
                      onClick={() => onOpenEditProductModal(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Редактировать товар"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Удалить товар "${p.name}" и всю историю его партий?`)) {
                          onDeleteProduct(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Удалить товар"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleExpand(p.id)}
                      className="flex items-center space-x-1 p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors text-xs font-semibold"
                    >
                      <span>Партии ({metrics.batchesCount})</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Collapsible History of Batches & Price changes for this product */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                          История партий и изменения стоимости для "{p.name}":
                        </h4>
                      </div>
                      <span className="text-2xs text-slate-500">
                        Каждая закупка считается по своей фактической цене
                      </span>
                    </div>

                    {metrics.sortedBatches.length === 0 ? (
                      <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                        Партий пока нет. Нажмите «Добавить партию», чтобы зафиксировать количество и цену.
                      </div>
                    ) : (
                      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-2xs">
                            <tr>
                              <th className="p-2.5 pl-3">№</th>
                              <th className="p-2.5">Дата закупки</th>
                              <th className="p-2.5 text-center">Количество</th>
                              <th className="p-2.5 text-right">Цена закупки</th>
                              <th className="p-2.5 text-right font-bold text-slate-900">Сумма партии</th>
                              <th className="p-2.5">Поставщик / Примечание</th>
                              <th className="p-2.5 text-center w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {metrics.sortedBatches.map((b, idx) => (
                              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-2.5 pl-3 font-mono text-slate-400 text-2xs">
                                  {idx + 1}
                                </td>
                                <td className="p-2.5 font-medium text-slate-800">
                                  {b.date || b.createdAt.slice(0, 10)}
                                </td>
                                <td className="p-2.5 text-center font-bold text-slate-900">
                                  {b.quantity} {p.unit}
                                </td>
                                <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                                  {formatCurrency(b.pricePerUnit, currency)}
                                </td>
                                <td className="p-2.5 text-right font-mono font-bold text-emerald-800">
                                  {formatCurrency(b.totalCost ?? b.quantity * b.pricePerUnit, currency)}
                                </td>
                                <td className="p-2.5 text-slate-600">
                                  <div className="flex items-center space-x-1.5">
                                    {b.supplier && (
                                      <span className="font-semibold text-slate-800">
                                        {b.supplier}
                                      </span>
                                    )}
                                    {b.note && (
                                      <span className="text-slate-500 italic">
                                        ({b.note})
                                      </span>
                                    )}
                                    {!b.supplier && !b.note && (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => {
                                      if (confirm('Удалить эту запись партии?')) {
                                        onDeleteBatch(p.id, b.id);
                                      }
                                    }}
                                    className="text-slate-300 hover:text-rose-600 p-1 rounded-sm transition-colors"
                                    title="Удалить партию"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500">
            Страница <strong className="text-slate-900 font-bold">{validCurrentPage}</strong> из{' '}
            <strong className="text-slate-900 font-bold">{totalPages}</strong> (всего{' '}
            {totalFilteredCount} позиций)
          </div>

          <div className="flex items-center space-x-1.5">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Первая страница"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Предыдущая страница"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            <div className="flex items-center space-x-1 px-1">
              {pageNumbers.map((num, idx) =>
                typeof num === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-colors ${
                      validCurrentPage === num
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-slate-400 text-xs">
                    ...
                  </span>
                )
              )}
            </div>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Следующая страница"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Последняя страница"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
