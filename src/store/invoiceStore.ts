import { create } from 'zustand';
import { InvoiceStatus, PaymentStatus } from '../utils/invoiceHelpers';

/**
 * Invoice interface
 */
export interface Invoice {
  id: string;
  invoice_number: string; // INV-2026-000001
  vendor_id?: string;
  vendor_name: string;
  trip_id?: string;
  amount: number;
  gst_amount: number;
  total_amount: number;
  amount_paid: number;
  status: InvoiceStatus;
  payment_status: PaymentStatus;
  issued_date: string;
  due_date: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Invoice Store interface
 */
interface InvoiceStore {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  getInvoiceByNumber: (invoiceNumber: string) => Invoice | undefined;
  getInvoicesByVendor: (vendorId: string) => Invoice[];
  getInvoicesByTrip: (tripId: string) => Invoice[];
  getInvoicesByStatus: (status: InvoiceStatus) => Invoice[];
  getInvoicesByPaymentStatus: (paymentStatus: PaymentStatus) => Invoice[];
  getInvoicesByDateRange: (startDate: string, endDate: string) => Invoice[];
  getOverdueInvoices: () => Invoice[];
  getTotalInvoiceAmount: (invoices?: Invoice[]) => number;
  getTotalPaidAmount: (invoices?: Invoice[]) => number;
  getTotalPendingAmount: (invoices?: Invoice[]) => number;
  getAllInvoices: () => Invoice[];
}

/**
 * Zustand Invoice Store
 */
export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],

  addInvoice: (invoice) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      invoices: [...state.invoices, newInvoice],
    }));

    return newInvoice;
  },

  updateInvoice: (id, updates) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : invoice
      ),
    }));
  },

  deleteInvoice: (id) => {
    set((state) => ({
      invoices: state.invoices.filter((invoice) => invoice.id !== id),
    }));
  },

  getInvoiceById: (id) => {
    const { invoices } = get();
    return invoices.find((invoice) => invoice.id === id);
  },

  getInvoiceByNumber: (invoiceNumber) => {
    const { invoices } = get();
    return invoices.find((invoice) => invoice.invoice_number === invoiceNumber);
  },

  getInvoicesByVendor: (vendorId) => {
    const { invoices } = get();
    return invoices.filter((invoice) => invoice.vendor_id === vendorId);
  },

  getInvoicesByTrip: (tripId) => {
    const { invoices } = get();
    return invoices.filter((invoice) => invoice.trip_id === tripId);
  },

  getInvoicesByStatus: (status) => {
    const { invoices } = get();
    return invoices.filter((invoice) => invoice.status === status);
  },

  getInvoicesByPaymentStatus: (paymentStatus) => {
    const { invoices } = get();
    return invoices.filter((invoice) => invoice.payment_status === paymentStatus);
  },

  getInvoicesByDateRange: (startDate, endDate) => {
    const { invoices } = get();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.issued_date).getTime();
      return invoiceDate >= start && invoiceDate <= end;
    });
  },

  getOverdueInvoices: () => {
    const { invoices } = get();
    const now = new Date().getTime();

    return invoices.filter((invoice) => {
      const dueDate = new Date(invoice.due_date).getTime();
      return dueDate < now && invoice.status !== 'paid' && invoice.status !== 'cancelled';
    });
  },

  getTotalInvoiceAmount: (invoices) => {
    const invoiceList = invoices || get().invoices;
    return invoiceList.reduce((total, invoice) => total + invoice.total_amount, 0);
  },

  getTotalPaidAmount: (invoices) => {
    const invoiceList = invoices || get().invoices;
    return invoiceList.reduce((total, invoice) => total + invoice.amount_paid, 0);
  },

  getTotalPendingAmount: (invoices) => {
    const invoiceList = invoices || get().invoices;
    return invoiceList.reduce(
      (total, invoice) => total + (invoice.total_amount - invoice.amount_paid),
      0
    );
  },

  getAllInvoices: () => {
    const { invoices } = get();
    return invoices;
  },
}));
