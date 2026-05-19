import { create } from 'zustand';
import { generateVehicleId } from '../utils/helpers';

export interface Vehicle {
  id: string;
  name: string;
  type: 'Truck' | 'Tempo' | 'Pickup';
  registration_number: string;
  owner_name: string;
  insurance_expiry?: string;
  puc_expiry?: string;
  next_service_km?: number;
  current_km?: number;
  status: 'Active' | 'In Trip' | 'Under Repair';
  created_at: string;
  updated_at: string;
}

interface VehicleStore {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => boolean;
  deleteVehicle: (id: string) => boolean;
  getVehicleById: (id: string) => Vehicle | null;
  getVehiclesByStatus: (status: string) => Vehicle[];
  getAllVehicles: () => Vehicle[];
  getVehicleCount: () => number;
  updateOdometer: (id: string, km: number) => boolean;
  getVehiclesWithExpiryAlerts: () => Vehicle[];
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],

  addVehicle: (vehicle) => {
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...vehicle,
      id: generateVehicleId(),
      created_at: now,
      updated_at: now,
    };
    set((state) => ({
      vehicles: [...state.vehicles, newVehicle],
    }));
    return newVehicle;
  },

  updateVehicle: (id, updates) => {
    const state = get();
    const index = state.vehicles.findIndex((v) => v.id === id);
    if (index === -1) return false;

    const updated = {
      ...state.vehicles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    const newVehicles = [...state.vehicles];
    newVehicles[index] = updated;
    set({ vehicles: newVehicles });
    return true;
  },

  deleteVehicle: (id) => {
    const state = get();
    const filtered = state.vehicles.filter((v) => v.id !== id);
    if (filtered.length === state.vehicles.length) return false;
    set({ vehicles: filtered });
    return true;
  },

  getVehicleById: (id) => {
    const state = get();
    return state.vehicles.find((v) => v.id === id) || null;
  },

  getVehiclesByStatus: (status) => {
    const state = get();
    return state.vehicles.filter((v) => v.status === status);
  },

  getAllVehicles: () => {
    const state = get();
    return state.vehicles;
  },

  getVehicleCount: () => {
    const state = get();
    return state.vehicles.length;
  },

  updateOdometer: (id, km) => {
    return get().updateVehicle(id, { current_km: km });
  },

  getVehiclesWithExpiryAlerts: () => {
    const state = get();
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return state.vehicles.filter((vehicle) => {
      const checks = [];
      if (vehicle.insurance_expiry) {
        const insuranceDate = new Date(vehicle.insurance_expiry);
        checks.push(insuranceDate <= thirtyDaysFromNow);
      }
      if (vehicle.puc_expiry) {
        const pucDate = new Date(vehicle.puc_expiry);
        checks.push(pucDate <= thirtyDaysFromNow);
      }
      return checks.some((check) => check);
    });
  },
}));
