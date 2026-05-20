/**
 * Invoice Management Helper Functions
 * Utilities for invoice generation, calculations, and tracking
 */

import { formatCurrency } from './helpers';

/**
 * Invoice status enum
 */
export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  OVERDUE = 'overdue',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

/**
 * Invoice payment status enum
 */
export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
}

/**
 * Generate unique invoice number
 * @param invoiceCount - Current count of invoices
 * @returns Formatted invoice number
 */
export const generateInvoiceNumber = (invoiceCount: number): string => {
  const year = new Date().getFullYear();
  const paddedNumber = String(invoiceCount + 1).padStart(6, '0');
  return `INV-${year}-${paddedNumber}`;
};

/**
 * Validate invoice number format
 * @param invoiceNumber - Invoice number to validate
 * @returns true if valid format
 */
export const validateInvoiceNumber = (invoiceNumber: string): boolean => {
  const invoiceRegex = /^INV-\d{4}-\d{6}$/;
  return invoiceRegex.test(invoiceNumber);
};

/**
 * Calculate GST amount (18%)
 * @param amount - Base amount
 * @param gstRate - GST rate percentage (default: 18)
 * @returns GST amount
 */
export const calculateGST = (amount: number, gstRate: number = 18): number => {
  return Math.round((amount * gstRate) / 100 * 100) / 100;
};

/**
 * Calculate total invoice amount (amount + GST)
 * @param amount - Base amount
 * @param gstRate - GST rate percentage (default: 18)
 * @returns Total amount with GST
 */
export const calculateInvoiceTotal = (
  amount: number,
  gstRate: number = 18
): number => {
  const gst = calculateGST(amount, gstRate);
  return Math.round((amount + gst) * 100) / 100;
};

/**
 * Get invoice status color
 * @param status - Invoice status
 * @returns Color code
 */
export const getInvoiceStatusColor = (status: InvoiceStatus): string => {
  const colors: Record<InvoiceStatus, string> = {
    draft: '#95A5A6',
    issued: '#3498DB',
    overdue: '#E74C3C',
    paid: '#27AE60',
    cancelled: '#7F8C8D',
  };
  return colors[status];
};

/**
 * Get invoice status label
 * @param status - Invoice status
 * @returns Human-readable status label
 */
export const getInvoiceStatusLabel = (status: InvoiceStatus): string => {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    issued: 'Issued',
    overdue: 'Overdue',
    paid: 'Paid',
    cancelled: 'Cancelled',
  };
  return labels[status];
};

/**
 * Get payment status color
 * @param status - Payment status
 * @returns Color code
 */
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors: Record<PaymentStatus, string> = {
    unpaid: '#E74C3C',
    partial: '#F39C12',
    paid: '#27AE60',
  };
  return colors[status];
};

/**
 * Get payment status label
 * @param status - Payment status
 * @returns Human-readable status label
 */
export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  const labels: Record<PaymentStatus, string> = {
    unpaid: 'Unpaid',
    partial: 'Partial',
    paid: 'Paid',
  };
  return labels[status];
};

/**
 * Check if invoice is overdue
 * @param dueDate - Invoice due date
 * @returns true if invoice is overdue
 */
export const isInvoiceOverdue = (dueDate: string): boolean => {
  const due = new Date(dueDate).getTime();
  const now = new Date().getTime();
  return due < now;
};

/**
 * Get days until due
 * @param dueDate - Invoice due date
 * @returns Days remaining (positive) or days overdue (negative)
 */
export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate invoice payment progress
 * @param amountPaid - Amount paid so far
 * @param totalAmount - Total invoice amount
 * @returns Payment percentage (0-100)
 */
export const calculatePaymentProgress = (
  amountPaid: number,
  totalAmount: number
): number => {
  if (totalAmount === 0) return 0;
  return Math.min(100, Math.round((amountPaid / totalAmount) * 100 * 100) / 100);
};

/**
 * Determine payment status based on amounts
 * @param amountPaid - Amount paid
 * @param totalAmount - Total invoice amount
 * @returns Payment status
 */
export const determinePaymentStatus = (
  amountPaid: number,
  totalAmount: number
): PaymentStatus => {
  if (amountPaid === 0) return PaymentStatus.UNPAID;
  if (amountPaid >= totalAmount) return PaymentStatus.PAID;
  return PaymentStatus.PARTIAL;
};

/**
 * Calculate pending amount
 * @param totalAmount - Total invoice amount
 * @param amountPaid - Amount already paid
 * @returns Remaining amount to be paid
 */
export const calculatePendingAmount = (
  totalAmount: number,
  amountPaid: number
): number => {
  return Math.max(0, Math.round((totalAmount - amountPaid) * 100) / 100);
};

/**
 * Validate invoice
 * @param invoice - Invoice object to validate
 * @returns Object with validation status and errors
 */
export const validateInvoice = (invoice: {
  invoice_number?: string;
  vendor_name: string;
  amount: number;
  due_date: string;
  trip_id?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!invoice.vendor_name?.trim()) {
    errors.push('Vendor name is required');
  }
  if (invoice.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (!invoice.due_date?.trim()) {
    errors.push('Due date is required');
  }
  if (new Date(invoice.due_date) < new Date()) {
    errors.push('Due date cannot be in the past');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format invoice summary
 * @param invoiceNumber - Invoice number
 * @param vendorName - Vendor name
 * @param amount - Invoice amount
 * @param status - Invoice status
 * @returns Formatted summary string
 */
export const formatInvoiceSummary = (
  invoiceNumber: string,
  vendorName: string,
  amount: number,
  status: InvoiceStatus
): string => {
  const statusLabel = getInvoiceStatusLabel(status);
  return `${invoiceNumber} - ${vendorName} | ${formatCurrency(amount)} | ${statusLabel}`;
};

/**
 * Calculate invoice aging (days since issued)
 * @param issuedDate - Date invoice was issued
 * @returns Number of days since issuance
 */
export const calculateInvoiceAging = (issuedDate: string): number => {
  const issued = new Date(issuedDate);
  const now = new Date();
  const diffMs = now.getTime() - issued.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
