import { v4 as uuidv4 } from 'uuid';
import { format, parse, differenceInDays, differenceInCalendarDays } from 'date-fns';

// ==================== ID & Number Generation ====================

export const generateId = (prefix: string = ''): string => {
  const uniqueId = uuidv4().slice(0, 8).toUpperCase();
  return prefix ? `${prefix}_${uniqueId}` : uniqueId;
};

export const generateVehicleId = (): string => generateId('VEH');
export const generateDriverId = (): string => generateId('DRV');
export const generateTripId = (): string => generateId('TRP');
export const generateVendorId = (): string => generateId('VND');
export const generateExpenseId = (): string => generateId('EXP');

export const generateLRNumber = (): string => {
  const date = new Date();
  const dateStr = format(date, 'yyyyMMdd');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LR-${dateStr}-${random}`;
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const month = format(date, 'MM');
  const year = format(date, 'yy');
  const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
  return `INV-${year}${month}-${random}`;
};

// ==================== Date Functions ====================

export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date;
    return format(d, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

export const formatDateForDisplay = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date;
    return format(d, 'd MMMM yyyy');
  } catch {
    return '';
  }
};

export const getCurrentDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const daysUntilExpiry = (expiryDate: string): number => {
  try {
    const expiry = parse(expiryDate, 'yyyy-MM-dd', new Date());
    return differenceInCalendarDays(expiry, new Date());
  } catch {
    return -1;
  }
};

export const isExpired = (expiryDate: string): boolean => {
  return daysUntilExpiry(expiryDate) < 0;
};

export const isExpiringSoon = (expiryDate: string, days: number = 30): boolean => {
  const daysRemaining = daysUntilExpiry(expiryDate);
  return daysRemaining >= 0 && daysRemaining <= days;
};

export const getExpiryStatus = (expiryDate: string): {
  status: 'Expired' | 'Expiring Soon' | 'Active';
  daysRemaining: number;
  color: string;
} => {
  const daysRemaining = daysUntilExpiry(expiryDate);
  
  if (daysRemaining < 0) {
    return { status: 'Expired', daysRemaining, color: '#FF3B30' };
  } else if (daysRemaining <= 30) {
    return { status: 'Expiring Soon', daysRemaining, color: '#FF9500' };
  } else {
    return { status: 'Active', daysRemaining, color: '#34C759' };
  }
};

export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
};

export const calculateAge = (birthDate: string): number => {
  try {
    const birth = parse(birthDate, 'yyyy-MM-dd', new Date());
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return 0;
  }
};

// ==================== Validation Functions ====================

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateGSTNumber = (gst: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  return gstRegex.test(gst.toUpperCase());
};

export const validateRegistrationNumber = (regNo: string): boolean => {
  const regRegex = /^[A-Z]{2}\s[0-9]{2}\s[A-Z]{2}\s[0-9]{4}$/;
  return regRegex.test(regNo.toUpperCase());
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// ==================== Currency & Financial Functions ====================

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatCurrencyNoDecimal = (amount: number): string => {
  return `₹${Math.round(amount)}`;
};

export const calculateMileage = (km: number, litres: number): number => {
  if (litres === 0) return 0;
  return parseFloat((km / litres).toFixed(2));
};

export const calculateCostPerKm = (amount: number, km: number): number => {
  if (km === 0) return 0;
  return parseFloat((amount / km).toFixed(2));
};

export const calculateProfit = (revenue: number, expenses: number): number => {
  return revenue - expenses;
};

export const calculateProfitMargin = (profit: number, revenue: number): number => {
  if (revenue === 0) return 0;
  return parseFloat(((profit / revenue) * 100).toFixed(2));
};

export const calculateGST = (amount: number, rate: number = 18): number => {
  return parseFloat(((amount * rate) / 100).toFixed(2));
};

export const calculateGSTBreakup = (totalAmount: number, gstRate: number = 18) => {
  const baseAmount = totalAmount / (1 + gstRate / 100);
  const gstAmount = totalAmount - baseAmount;
  return {
    baseAmount: parseFloat(baseAmount.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    totalAmount: totalAmount,
  };
};

export const calculateOutstandingBalance = (totalAmount: number, paidAmount: number): number => {
  return parseFloat((totalAmount - paidAmount).toFixed(2));
};

export const calculateEMIAmount = (
  principalAmount: number,
  annualRate: number,
  tenureMonths: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = principalAmount * (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return parseFloat(emi.toFixed(2));
};

// ==================== Status & Display Functions ====================

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'Active': '#34C759',
    'Pending': '#FF9500',
    'Completed': '#34C759',
    'Cancelled': '#FF3B30',
    'In Trip': '#007AFF',
    'Under Repair': '#FF3B30',
    'On Leave': '#FF9500',
    'Inactive': '#8E8E93',
    'Draft': '#A2845E',
    'Sent': '#007AFF',
    'Paid': '#34C759',
    'Overdue': '#FF3B30',
    'Expired': '#FF3B30',
    'Expiring Soon': '#FF9500',
  };
  return colorMap[status] || '#8E8E93';
};

export const getVehicleTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'Truck': '🚛',
    'Tempo': '🚐',
    'Pickup': '🚙',
  };
  return iconMap[type] || '🚗';
};

export const getVehicleTypeLabel = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const getPaymentTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'Paid': 'Paid',
    'To-Pay': 'To Pay',
    'To-Be-Billed': 'To Be Billed',
  };
  return labelMap[type] || type;
};

export const getExpenseCategory = (category: string): string => {
  const categoryIcons: Record<string, string> = {
    'Diesel': '⛽',
    'Toll': '🛣️',
    'Repair': '🔧',
    'Tyre': '🛞',
    'Driver Salary': '👨‍✈️',
    'Cleaning': '🧹',
    'Parking': '🅿️',
    'Miscellaneous': '📌',
  };
  return categoryIcons[category] || '💰';
};

// ==================== String Functions ====================

export const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const toUpperCase = (text: string): string => {
  return text.toUpperCase();
};

export const toLowerCase = (text: string): string => {
  return text.toLowerCase();
};

// ==================== Array & Object Functions ====================

export const isEmpty = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

export const sortByDate = (array: any[], dateField: string = 'created_at', ascending: boolean = false) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateField]).getTime();
    const dateB = new Date(b[dateField]).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortByAmount = (array: any[], amountField: string = 'amount', ascending: boolean = true) => {
  return [...array].sort((a, b) => {
    return ascending ? a[amountField] - b[amountField] : b[amountField] - a[amountField];
  });
};

export const groupBy = (array: any[], key: string): Record<string, any[]> => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

// ==================== Conversion Functions ====================

export const kmToMiles = (km: number): number => {
  return parseFloat((km * 0.621371).toFixed(2));
};

export const milesToKm = (miles: number): number => {
  return parseFloat((miles / 0.621371).toFixed(2));
};

export const kgToLbs = (kg: number): number => {
  return parseFloat((kg * 2.20462).toFixed(2));
};

export const lbsToKg = (lbs: number): number => {
  return parseFloat((lbs / 2.20462).toFixed(2));
};

// ==================== Utility Functions ====================

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100;
};

export const getPercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(2));
};

export default {
  // ID Generation
  generateId,
  generateVehicleId,
  generateDriverId,
  generateTripId,
  generateVendorId,
  generateExpenseId,
  generateLRNumber,
  generateInvoiceNumber,
  
  // Date Functions
  formatDate,
  formatDateForDisplay,
  getCurrentDate,
  getCurrentTimestamp,
  daysUntilExpiry,
  isExpired,
  isExpiringSoon,
  getExpiryStatus,
  
  // Validation
  validatePhoneNumber,
  validateEmail,
  validateGSTNumber,
  validateRegistrationNumber,
  formatPhoneNumber,
  
  // Currency & Calculations
  formatCurrency,
  formatCurrencyNoDecimal,
  calculateMileage,
  calculateCostPerKm,
  calculateProfit,
  calculateProfitMargin,
  calculateGST,
  calculateGSTBreakup,
  calculateOutstandingBalance,
  calculateEMIAmount,
  
  // Status & Display
  getStatusColor,
  getVehicleTypeIcon,
  getPaymentTypeLabel,
  getExpenseCategory,
  
  // String Functions
  truncateText,
  capitalize,
  
  // Array & Object
  isEmpty,
  sortByDate,
  sortByAmount,
  groupBy,
  
  // Conversions
  kmToMiles,
  milesToKm,
  kgToLbs,
  lbsToKg,
};
