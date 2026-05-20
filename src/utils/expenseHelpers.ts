/**
 * Expense Management Helper Functions
 * Utilities for expense operations, categorization, and calculations
 */

import { formatCurrency } from './helpers';

/**
 * Expense category enum
 */
export enum ExpenseCategory {
  FUEL = 'fuel',
  TOLL = 'toll',
  MAINTENANCE = 'maintenance',
  DRIVER_SALARY = 'driver_salary',
  INSURANCE = 'insurance',
  REGISTRATION = 'registration',
  SPARE_PARTS = 'spare_parts',
  CLEANING = 'cleaning',
  VEHICLE_WASH = 'vehicle_wash',
  OTHER = 'other',
}

/**
 * Get category color
 * @param category - Expense category
 * @returns Color code
 */
export const getCategoryColor = (category: ExpenseCategory): string => {
  const colors: Record<ExpenseCategory, string> = {
    fuel: '#E74C3C',
    toll: '#F39C12',
    maintenance: '#3498DB',
    driver_salary: '#9B59B6',
    insurance: '#1ABC9C',
    registration: '#34495E',
    spare_parts: '#E67E22',
    cleaning: '#16A085',
    vehicle_wash: '#2980B9',
    other: '#95A5A6',
  };
  return colors[category];
};

/**
 * Get category label
 * @param category - Expense category
 * @returns Human-readable category label
 */
export const getCategoryLabel = (category: ExpenseCategory): string => {
  const labels: Record<ExpenseCategory, string> = {
    fuel: '⛽ Fuel',
    toll: '🚦 Toll',
    maintenance: '🔧 Maintenance',
    driver_salary: '💰 Driver Salary',
    insurance: '📋 Insurance',
    registration: '📝 Registration',
    spare_parts: '🔩 Spare Parts',
    cleaning: '🧹 Cleaning',
    vehicle_wash: '🚗 Vehicle Wash',
    other: '📌 Other',
  };
  return labels[category];
};

/**
 * Generate unique expense ID
 * @param expenseCount - Current count of expenses
 * @returns Formatted expense ID
 */
export const generateExpenseId = (expenseCount: number): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const paddedNumber = String(expenseCount + 1).padStart(5, '0');
  return `EXP-${date}-${paddedNumber}`;
};

/**
 * Validate expense amount
 * @param amount - Amount to validate
 * @returns true if amount is valid
 */
export const validateExpenseAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999.99;
};

/**
 * Calculate total expenses
 * @param expenses - Array of expense objects
 * @returns Total sum of all expenses
 */
export const calculateTotalExpenses = (
  expenses: Array<{ amount: number }>
): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

/**
 * Calculate expenses by category
 * @param expenses - Array of expense objects
 * @returns Object with category totals
 */
export const calculateExpensesByCategory = (
  expenses: Array<{ amount: number; category: ExpenseCategory }>
): Record<ExpenseCategory, number> => {
  const categoryTotals: Record<ExpenseCategory, number> = {
    fuel: 0,
    toll: 0,
    maintenance: 0,
    driver_salary: 0,
    insurance: 0,
    registration: 0,
    spare_parts: 0,
    cleaning: 0,
    vehicle_wash: 0,
    other: 0,
  };

  expenses.forEach((expense) => {
    categoryTotals[expense.category] += expense.amount;
  });

  return categoryTotals;
};

/**
 * Calculate percentage of category from total
 * @param categoryAmount - Amount for specific category
 * @param totalAmount - Total amount of all expenses
 * @returns Percentage (0-100)
 */
export const calculateCategoryPercentage = (
  categoryAmount: number,
  totalAmount: number
): number => {
  if (totalAmount === 0) return 0;
  return Math.round((categoryAmount / totalAmount) * 100 * 100) / 100;
};

/**
 * Get highest expense category
 * @param categoryTotals - Object with category totals
 * @returns Highest category and amount
 */
export const getHighestExpenseCategory = (
  categoryTotals: Record<ExpenseCategory, number>
): { category: ExpenseCategory; amount: number } => {
  let maxCategory = ExpenseCategory.FUEL;
  let maxAmount = 0;

  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      maxCategory = category as ExpenseCategory;
    }
  });

  return { category: maxCategory, amount: maxAmount };
};

/**
 * Calculate daily average expense
 * @param totalExpense - Total expense amount
 * @param dayCount - Number of days
 * @returns Daily average
 */
export const calculateDailyAverage = (
  totalExpense: number,
  dayCount: number
): number => {
  if (dayCount <= 0) return 0;
  return Math.round((totalExpense / dayCount) * 100) / 100;
};

/**
 * Validate expense
 * @param expense - Expense object to validate
 * @returns Object with validation status and errors
 */
export const validateExpense = (expense: {
  description: string;
  amount: number;
  category: ExpenseCategory;
  trip_id?: string;
  date: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!expense.description?.trim()) {
    errors.push('Expense description is required');
  }
  if (!validateExpenseAmount(expense.amount)) {
    errors.push('Amount must be between 0 and 999999.99');
  }
  if (!Object.values(ExpenseCategory).includes(expense.category)) {
    errors.push('Invalid category selected');
  }
  if (!expense.date?.trim()) {
    errors.push('Date is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format expense summary
 * @param description - Expense description
 * @param amount - Expense amount
 * @param date - Expense date
 * @returns Formatted summary string
 */
export const formatExpenseSummary = (
  description: string,
  amount: number,
  date: string
): string => {
  return `${description} | ${formatCurrency(amount)} | ${date}`;
};

/**
 * Get expense trend (increasing/decreasing)
 * @param currentExpense - Current period expense
 * @param previousExpense - Previous period expense
 * @returns Trend indicator and percentage change
 */
export const getExpenseTrend = (
  currentExpense: number,
  previousExpense: number
): { trend: 'up' | 'down' | 'stable'; change: number } => {
  if (previousExpense === 0) {
    return { trend: 'stable', change: 0 };
  }

  const change = ((currentExpense - previousExpense) / previousExpense) * 100;

  if (change > 5) {
    return { trend: 'up', change: Math.round(change * 100) / 100 };
  } else if (change < -5) {
    return { trend: 'down', change: Math.round(change * 100) / 100 };
  }
  return { trend: 'stable', change: 0 };
};

/**
 * Calculate fuel cost per km
 * @param fuelCost - Total fuel cost
 * @param distance - Distance traveled in km
 * @returns Cost per km
 */
export const calculateFuelCostPerKm = (
  fuelCost: number,
  distance: number
): number => {
  if (distance <= 0) return 0;
  return Math.round((fuelCost / distance) * 100) / 100;
};

/**
 * Get budget status
 * @param spent - Amount spent
 * @param budget - Budget limit
 * @returns Status with percentage
 */
export const getBudgetStatus = (
  spent: number,
  budget: number
): { status: 'under' | 'warning' | 'over'; percentage: number } => {
  const percentage = (spent / budget) * 100;

  if (percentage > 100) {
    return { status: 'over', percentage: Math.round(percentage * 100) / 100 };
  } else if (percentage > 80) {
    return { status: 'warning', percentage: Math.round(percentage * 100) / 100 };
  }
  return { status: 'under', percentage: Math.round(percentage * 100) / 100 };
};
