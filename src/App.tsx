import React, { useState, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CalculatorView } from './components/CalculatorView';
import { ProductsView } from './components/ProductsView';
import { HistoryView } from './components/HistoryView';
import { BatchAddModal } from './components/BatchAddModal';
import { ProductFormModal } from './components/ProductFormModal';
import { ExcelModal } from './components/ExcelModal';
import { Product, CalculationRecord, CalculationItem, Batch, AppData } from './types';
import { getInitialLocalData, saveLocalData } from './utils/storage';
import { generateTestProducts } from './utils/demo';

export default function App() {
  // Initial local state directly from this device's localStorage
  const initialData = useRef(getInitialLocalData()).current;

  const [activeTab, setActiveTab] = useState<'calculator' | 'products' | 'history'>('calculator');
  const [currency, setCurrency] = useState<string>(initialData.currency || '₽');
  const [products, setProducts] = useState<Product[]>(initialData.products || []);
  const [calculations, setCalculations] = useState<CalculationRecord[]>(initialData.calculations || []);
  const [, setLastModified] = useState<number>(initialData.lastModified || Date.now());

  // Modals state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [batchTargetProduct, setBatchTargetProduct] = useState<Product | null>(null);

  // Loaded calculation state for transferring history into calculator
  const [loadedCalculation, setLoadedCalculation] = useState<{
    items: CalculationItem[];
    title: string;
  } | null>(null);

  // Helper to persist state to device localStorage immediately
  const updateAppData = useCallback(
    (newProducts: Product[], newCalculations?: CalculationRecord[], newCurrency?: string) => {
      const now = Date.now();
      setProducts(newProducts);
      if (newCalculations) setCalculations(newCalculations);
      if (newCurrency) setCurrency(newCurrency);
      setLastModified(now);

      const updatedData: AppData = {
        syncId: 'local',
        currency: newCurrency || currency,
        products: newProducts,
        calculations: newCalculations || calculations,
        lastModified: now,
      };

      saveLocalData(updatedData);
    },
    [currency, calculations]
  );

  // Calculator record saving
  const handleSaveCalculation = (calc: CalculationRecord) => {
    const next = [calc, ...calculations];
    updateAppData(products, next);
  };

  // Save product (create or edit)
  const handleSaveProduct = (prodData: {
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
  }) => {
    const nowIso = new Date().toISOString();
    if (productToEdit) {
      // Edit existing product
      const updated = products.map((p) => {
        if (p.id !== productToEdit.id) return p;
        return {
          ...p,
          name: prodData.name,
          category: prodData.category,
          unit: prodData.unit,
          updatedAt: nowIso,
        };
      });
      updateAppData(updated);
    } else {
      // Create new product
      const newProdId = `prod-${Date.now()}`;
      const newBatches: Batch[] = [];

      if (prodData.initialBatch && prodData.initialBatch.quantity > 0) {
        newBatches.push({
          id: `batch-${Date.now()}`,
          productId: newProdId,
          date: prodData.initialBatch.date || new Date().toISOString().slice(0, 10),
          quantity: prodData.initialBatch.quantity,
          pricePerUnit: prodData.initialBatch.price,
          totalCost: prodData.initialBatch.quantity * prodData.initialBatch.price,
          supplier: prodData.initialBatch.supplier,
          note: prodData.initialBatch.note,
          createdAt: nowIso,
        });
      }

      const newProd: Product = {
        id: newProdId,
        name: prodData.name,
        category: prodData.category,
        unit: prodData.unit,
        batches: newBatches,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      updateAppData([newProd, ...products]);
    }

    setIsNewProductModalOpen(false);
    setProductToEdit(null);
  };

  // Add batch to existing product
  const handleAddBatch = (productId: string, batchData: Omit<Batch, 'id' | 'productId' | 'createdAt'>) => {
    const nowIso = new Date().toISOString();
    const updated = products.map((p) => {
      if (p.id !== productId) return p;
      const newBatch: Batch = {
        ...batchData,
        id: `batch-${Date.now()}`,
        productId,
        createdAt: nowIso,
      };
      return {
        ...p,
        batches: [newBatch, ...(p.batches || [])],
        updatedAt: nowIso,
      };
    });
    updateAppData(updated);
    setBatchTargetProduct(null);
  };

  // Add new product directly from calculator quick-modal
  const handleAddNewProductFromCalc = (productData: {
    name: string;
    category?: string;
    unit: string;
    initialBatch?: {
      quantity: number;
      price: number;
      date?: string;
      supplier?: string;
      note?: string;
    };
  }) => {
    handleSaveProduct({
      name: productData.name,
      category: productData.category || 'Продукты питания',
      unit: productData.unit,
      initialBatch: productData.initialBatch,
    });
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    updateAppData(updated);
  };

  // Delete specific batch from product
  const handleDeleteBatch = (productId: string, batchId: string) => {
    const updated = products.map((p) => {
      if (p.id !== productId) return p;
      return {
        ...p,
        batches: p.batches.filter((b) => b.id !== batchId),
        updatedAt: new Date().toISOString(),
      };
    });
    updateAppData(updated);
  };

  // Delete calculation record
  const handleDeleteCalculation = (id: string) => {
    const updated = calculations.filter((c) => c.id !== id);
    updateAppData(products, updated);
  };

  // Clear history
  const handleClearHistory = () => {
    updateAppData(products, []);
  };

  // Load calculation from history into calculator
  const handleLoadIntoCalculator = (items: CalculationItem[], title: string) => {
    setLoadedCalculation({
      items,
      title,
    });
    setActiveTab('calculator');
  };

  // Excel bulk import
  const handleImportComplete = (importedProducts: Product[], replace: boolean) => {
    if (replace) {
      updateAppData(importedProducts);
    } else {
      // Merge unique
      const existingNames = new Set(products.map((p) => p.name.trim().toLowerCase()));
      const toAdd = importedProducts.filter((p) => !existingNames.has(p.name.trim().toLowerCase()));
      updateAppData([...products, ...toAdd]);
    }
  };

  // Demo products generator (1 000 items)
  const handleGenerate1000Demo = () => {
    const demo = generateTestProducts(1000);
    const nonDemo = products.filter((p) => !p.id.startsWith('test-prod-'));
    updateAppData([...demo, ...nonDemo]);
  };

  // Clear 1 000 demo products
  const handleClearDemo = () => {
    const filtered = products.filter((p) => !p.id.startsWith('test-prod-'));
    updateAppData(filtered);
  };

  const hasDemoProducts = products.some((p) => p.id.startsWith('test-prod-'));

  // Unique categories list
  const allCategories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={(c) => updateAppData(products, calculations, c)}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        productsCount={products.length}
        historyCount={calculations.length}
      />

      {/* Main Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calculator' && (
          <CalculatorView
            products={products}
            currency={currency}
            onSaveCalculation={handleSaveCalculation}
            onAddNewBatchToProduct={handleAddBatch}
            onAddNewProduct={handleAddNewProductFromCalc}
            loadedItems={loadedCalculation?.items || null}
            loadedTitle={loadedCalculation?.title || null}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={products}
            currency={currency}
            onOpenNewProductModal={() => {
              setProductToEdit(null);
              setIsNewProductModalOpen(true);
            }}
            onOpenEditProductModal={(p) => {
              setProductToEdit(p);
              setIsNewProductModalOpen(true);
            }}
            onOpenAddBatchModal={(p) => setBatchTargetProduct(p)}
            onDeleteProduct={handleDeleteProduct}
            onDeleteBatch={handleDeleteBatch}
            onGenerate1000Demo={handleGenerate1000Demo}
            onClearDemo={handleClearDemo}
            hasDemoProducts={hasDemoProducts}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            calculations={calculations}
            currency={currency}
            onLoadIntoCalculator={handleLoadIntoCalculator}
            onDeleteCalculation={handleDeleteCalculation}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Modals */}
      <BatchAddModal
        isOpen={!!batchTargetProduct}
        onClose={() => setBatchTargetProduct(null)}
        product={batchTargetProduct}
        onAddBatch={handleAddBatch}
        currency={currency}
      />

      <ProductFormModal
        isOpen={isNewProductModalOpen}
        onClose={() => {
          setIsNewProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSaveProduct={handleSaveProduct}
        currency={currency}
        existingCategories={allCategories}
      />

      <ExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        products={products}
        calculations={calculations}
        currency={currency}
        onImportComplete={handleImportComplete}
      />

    </div>
  );
}
