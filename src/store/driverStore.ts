import { create } from 'zustand';
import { generateDriverId, validatePhoneNumber } from '../utils/helpers';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license_number: string;
  license_expiry?: string;
  address?: string;
  join_date: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  created_at: string;
  updated_at: string;
}

interface DriverStore {
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) => Driver | null;
  updateDriver: (id: string, updates: Partial<Driver>) => boolean;
  deleteDriver: (id: string) => boolean;
  getDriverById: (id: string) => Driver | null;
  getActiveDrivers: () => Driver[];
  getAllDrivers: () => Driver[];
  getDriverCount: () => number;
  searchDrivers: (query: string) => Driver[];
  getDriversWithLicenseExpiry: () => Driver[];
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  drivers: [],

  addDriver: (driver) => {
    // Validate phone number
    if (!validatePhoneNumber(driver.phone)) {
      console.error('Invalid phone number');
      return null;
    }

    const now = new Date().toISOString();
    const newDriver: Driver = {
      ...driver,
      id: generateDriverId(),
      created_at: now,
      updated_at: now,
    };
    set((state) => ({
      drivers: [...state.drivers, newDriver],
    }));
    return newDriver;
  },

  updateDriver: (id, updates) => {
    const state = get();
    const index = state.drivers.findIndex((d) => d.id === id);
    if (index === -1) return false;

    // Validate phone if updating
    if (updates.phone && !validatePhoneNumber(updates.phone)) {
      console.error('Invalid phone number');
      return false;
    }

    const updated = {
      ...state.drivers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    const newDrivers = [...state.drivers];
    newDrivers[index] = updated;
    set({ drivers: newDrivers });
    return true;
  },

  deleteDriver: (id) => {
    const state = get();
    const filtered = state.drivers.filter((d) => d.id !== id);
    if (filtered.length === state.drivers.length) return false;
    set({ drivers: filtered });
    return true;
  },

  getDriverById: (id) => {
    const state = get();
    return state.drivers.find((d) => d.id === id) || null;
  },

  getActiveDrivers: () => {
    const state = get();
    return state.drivers.filter((d) => d.status === 'Active');
  },

  getAllDrivers: () => {
    const state = get();
    return state.drivers;
  },

  getDriverCount: () => {
    const state = get();
    return state.drivers.length;
  },

  searchDrivers: (query) => {
    const state = get();
    const lowerQuery = query.toLowerCase();
    return state.drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.phone.includes(query) ||
        d.license_number.toLowerCase().includes(lowerQuery)
    );
  },

  getDriversWithLicenseExpiry: () => {
    const state = get();
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return state.drivers.filter((driver) => {
      if (!driver.license_expiry) return false;
      const expiryDate = new Date(driver.license_expiry);
      return expiryDate <= thirtyDaysFromNow;
    });
  },
}));
