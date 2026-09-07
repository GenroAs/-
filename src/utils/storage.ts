import { AppData, INITIAL_PRODUCTS } from '../types';

const STORAGE_KEY = 'wynns_app_data_v1';

export function getInitialLocalData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }

  return {
    syncId: 'local',
    currency: '₽',
    products: INITIAL_PRODUCTS,
    calculations: [],
    lastModified: Date.now(),
  };
}

export function saveLocalData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function resetToEmptyData(): AppData {
  const emptyData: AppData = {
    syncId: 'local',
    currency: '₽',
    products: [],
    calculations: [],
    lastModified: Date.now(),
  };
  saveLocalData(emptyData);
  return emptyData;
}

export function resetToSampleData(): AppData {
  const sampleData: AppData = {
    syncId: 'local',
    currency: '₽',
    products: INITIAL_PRODUCTS,
    calculations: [],
    lastModified: Date.now(),
  };
  saveLocalData(sampleData);
  return sampleData;
}
