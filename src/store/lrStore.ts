import { create } from 'zustand';

/**
 * Lorry Receipt (LR) interface
 */
export interface LorryReceipt {
  id: string;
  lr_number: string; // Generated (LR/2024/0001)
  trip_id: string;
  vehicle_id: string;
  driver_id: string;
  vendor_id?: string;
  consignor_name: string;
  consignor_phone: string;
  consignor_address?: string;
  consignee_name: string;
  consignee_phone: string;
  consignee_address?: string;
  goods_description: string;
  weight_kg: number;
  freight_amount: number;
  status: 'created' | 'in_transit' | 'delivered' | 'cancelled';
  delivery_date?: string;
  delivery_notes?: string;
  gst_applicable: boolean;
  gst_amount?: number;
  created_at: string;
  updated_at: string;
}

/**
 * LR Store interface
 */
interface LRStore {
  lrs: LorryReceipt[];
  addLR: (lr: Omit<LorryReceipt, 'id' | 'created_at' | 'updated_at'>) => LorryReceipt;
  updateLR: (id: string, updates: Partial<LorryReceipt>) => void;
  deleteLR: (id: string) => void;
  getLRById: (id: string) => LorryReceipt | undefined;
  getLRByNumber: (lrNumber: string) => LorryReceipt | undefined;
  getLRsByTrip: (tripId: string) => LorryReceipt[];
  getLRsByVehicle: (vehicleId: string) => LorryReceipt[];
  getLRsByDriver: (driverId: string) => LorryReceipt[];
  getLRsByVendor: (vendorId: string) => LorryReceipt[];
  getLRsByStatus: (status: LorryReceipt['status']) => LorryReceipt[];
  getLRsByDateRange: (startDate: string, endDate: string) => LorryReceipt[];
  getTripRevenue: (tripId: string) => number;
  getAllLRs: () => LorryReceipt[];
}

/**
 * Zustand LR Store
 */
export const useLRStore = create<LRStore>((set, get) => ({
  lrs: [],

  addLR: (lr) => {
    const newLR: LorryReceipt = {
      ...lr,
      id: `lr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      lrs: [...state.lrs, newLR],
    }));

    return newLR;
  },

  updateLR: (id, updates) => {
    set((state) => ({
      lrs: state.lrs.map((lr) =>
        lr.id === id
          ? {
              ...lr,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : lr
      ),
    }));
  },

  deleteLR: (id) => {
    set((state) => ({
      lrs: state.lrs.filter((lr) => lr.id !== id),
    }));
  },

  getLRById: (id) => {
    const { lrs } = get();
    return lrs.find((lr) => lr.id === id);
  },

  getLRByNumber: (lrNumber) => {
    const { lrs } = get();
    return lrs.find((lr) => lr.lr_number === lrNumber);
  },

  getLRsByTrip: (tripId) => {
    const { lrs } = get();
    return lrs.filter((lr) => lr.trip_id === tripId);
  },

  getLRsByVehicle: (vehicleId) => {
    const { lrs } = get();
    return lrs.filter((lr) => lr.vehicle_id === vehicleId);
  },

  getLRsByDriver: (driverId) => {
    const { lrs } = get();
    return lrs.filter((lr) => lr.driver_id === driverId);
  },

  getLRsByVendor: (vendorId) => {
    const { lrs } = get();
    return lrs.filter((lr) => lr.vendor_id === vendorId);
  },

  getLRsByStatus: (status) => {
    const { lrs } = get();
    return lrs.filter((lr) => lr.status === status);
  },

  getLRsByDateRange: (startDate, endDate) => {
    const { lrs } = get();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return lrs.filter((lr) => {
      const lrDate = new Date(lr.created_at).getTime();
      return lrDate >= start && lrDate <= end;
    });
  },

  getTripRevenue: (tripId) => {
    const { lrs } = get();
    const tripLRs = lrs.filter((lr) => lr.trip_id === tripId);
    return tripLRs.reduce((total, lr) => total + lr.freight_amount, 0);
  },

  getAllLRs: () => {
    const { lrs } = get();
    return lrs;
  },
}));
