/**
 * Lorry Receipt (LR) Management Helper Functions
 * Utilities for LR operations, validations, and formatting
 */

/**
 * Generate unique LR Number (LR/2024/0001, LR/2024/0002, etc.)
 * @param lrCount - Current count of LRs created
 * @returns Formatted LR number
 */
export const generateLRNumber = (lrCount: number): string => {
  const year = new Date().getFullYear();
  const paddedNumber = String(lrCount + 1).padStart(4, '0');
  return `LR/${year}/${paddedNumber}`;
};

/**
 * Validate LR number format
 * @param lrNumber - LR number to validate
 * @returns true if LR number format is valid
 */
export const validateLRNumber = (lrNumber: string): boolean => {
  const lrRegex = /^LR\/\d{4}\/\d{4}$/;
  return lrRegex.test(lrNumber);
};

/**
 * Validate consignor/consignee phone number (10 digits for Indian numbers)
 * @param phone - Phone number to validate
 * @returns true if phone number is valid
 */
export const validateLRPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Calculate freight charges based on weight and distance
 * @param weight - Weight in kilograms
 * @param distance - Distance in kilometers
 * @param ratePerKmPerKg - Rate per km per kg (in Rupees)
 * @returns Calculated freight amount
 */
export const calculateFreight = (
  weight: number,
  distance: number,
  ratePerKmPerKg: number = 0.05
): number => {
  return Math.round(weight * distance * ratePerKmPerKg * 100) / 100;
};

/**
 * Get LR status color
 * @param status - LR status
 * @returns Color code
 */
export const getLRStatusColor = (
  status: 'created' | 'in_transit' | 'delivered' | 'cancelled'
): string => {
  const statusColors: Record<string, string> = {
    created: '#F39C12', // Amber
    in_transit: '#3498DB', // Blue
    delivered: '#27AE60', // Green
    cancelled: '#E74C3C', // Red
  };
  return statusColors[status] || '#95A5A6';
};

/**
 * Get LR status label
 * @param status - LR status
 * @returns Human-readable status label
 */
export const getLRStatusLabel = (
  status: 'created' | 'in_transit' | 'delivered' | 'cancelled'
): string => {
  const statusLabels: Record<string, string> = {
    created: 'Created',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return statusLabels[status] || 'Unknown';
};

/**
 * Calculate revenue from LR freight amount
 * @param freightAmount - Freight amount in Rupees
 * @param commissionPercentage - Commission percentage (default: 10%)
 * @returns Net revenue after commission
 */
export const calculateLRRevenue = (
  freightAmount: number,
  commissionPercentage: number = 10
): number => {
  const commission = (freightAmount * commissionPercentage) / 100;
  return Math.round((freightAmount - commission) * 100) / 100;
};

/**
 * Format LR delivery details
 * @param consigneeName - Consignee name
 * @param consigneePhone - Consignee phone
 * @returns Formatted delivery info
 */
export const formatLRDeliveryInfo = (consigneeName: string, consigneePhone: string): string => {
  return `${consigneeName} (${consigneePhone})`;
};

/**
 * Validate LR before submission
 * @param lr - LR object to validate
 * @returns Object with validation status and errors
 */
export const validateLR = (lr: {
  lr_number?: string;
  consignor_name: string;
  consignor_phone: string;
  consignee_name: string;
  consignee_phone: string;
  goods_description: string;
  weight_kg: number;
  freight_amount: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!lr.consignor_name?.trim()) {
    errors.push('Consignor name is required');
  }
  if (!validateLRPhoneNumber(lr.consignor_phone)) {
    errors.push('Invalid consignor phone number');
  }
  if (!lr.consignee_name?.trim()) {
    errors.push('Consignee name is required');
  }
  if (!validateLRPhoneNumber(lr.consignee_phone)) {
    errors.push('Invalid consignee phone number');
  }
  if (!lr.goods_description?.trim()) {
    errors.push('Goods description is required');
  }
  if (lr.weight_kg <= 0) {
    errors.push('Weight must be greater than 0');
  }
  if (lr.freight_amount < 0) {
    errors.push('Freight amount cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate total LR revenue for a trip
 * @param lrs - Array of LR objects
 * @returns Total revenue from all LRs
 */
export const calculateTripLRRevenue = (
  lrs: Array<{ freight_amount: number }>
): number => {
  return lrs.reduce((total, lr) => total + lr.freight_amount, 0);
};

/**
 * Get LR icon based on status
 * @param status - LR status
 * @returns Emoji icon
 */
export const getLRStatusIcon = (
  status: 'created' | 'in_transit' | 'delivered' | 'cancelled'
): string => {
  const icons: Record<string, string> = {
    created: '📋',
    in_transit: '🚛',
    delivered: '✅',
    cancelled: '❌',
  };
  return icons[status] || '📦';
};

/**
 * Check if LR delivery is overdue
 * @param deliveryDate - Expected delivery date
 * @returns true if delivery is overdue
 */
export const isLRDeliveryOverdue = (deliveryDate: string): boolean => {
  const delivery = new Date(deliveryDate).getTime();
  const now = new Date().getTime();
  return delivery < now;
};

/**
 * Format LR summary for display
 * @param lrNumber - LR number
 * @param consigneeName - Consignee name
 * @param weight - Weight in kg
 * @param freightAmount - Freight amount
 * @returns Formatted summary string
 */
export const formatLRSummary = (
  lrNumber: string,
  consigneeName: string,
  weight: number,
  freightAmount: number
): string => {
  return `${lrNumber} - To: ${consigneeName} | ${weight}kg | ₹${freightAmount}`;
};

/**
 * Get LR days remaining for delivery
 * @param deliveryDate - Expected delivery date
 * @returns Days remaining (positive) or days overdue (negative)
 */
export const getLRDaysRemaining = (deliveryDate: string): number => {
  const delivery = new Date(deliveryDate);
  const now = new Date();
  const diffMs = delivery.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
};
