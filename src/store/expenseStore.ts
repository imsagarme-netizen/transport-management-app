import { create } from 'zustand';
import { ExpenseCategory } from '../utils/expenseHelpers';

/**
 * Expense interface
 */
export interface Expense {
  id: string;
  expense_id: string; // EXP-20260520-00001
  vehicle_id: string;
  trip_id?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Expense Store interface
 */
interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpenseById: (id: string) => Expense | undefined;
  getExpensesByVehicle: (vehicleId: string) => Expense[];
  getExpensesByTrip: (tripId: string) => Expense[];
  getExpensesByCategory: (category: ExpenseCategory) => Expense[];
  getExpensesByDateRange: (startDate: string, endDate: string) => Expense[];
  getTotalExpenses: (expenses?: Expense[]) => number;
  getCategoryTotal: (category: ExpenseCategory) => number;
  getAllExpenses: () => Expense[];
}

/**
 * Zustand Expense Store
 */
export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],

  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      expenses: [...state.expenses, newExpense],
    }));

    return newExpense;
  },

  updateExpense: (id, updates) => {
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : expense
      ),
    }));
  },

  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
    }));
  },

  getExpenseById: (id) => {
    const { expenses } = get();
    return expenses.find((expense) => expense.id === id);
  },

  getExpensesByVehicle: (vehicleId) => {
    const { expenses } = get();
    return expenses.filter((expense) => expense.vehicle_id === vehicleId);
  },

  getExpensesByTrip: (tripId) => {
    const { expenses } = get();
    return expenses.filter((expense) => expense.trip_id === tripId);
  },

  getExpensesByCategory: (category) => {
    const { expenses } = get();
    return expenses.filter((expense) => expense.category === category);
  },

  getExpensesByDateRange: (startDate, endDate) => {
    const { expenses } = get();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date).getTime();
      return expenseDate >= start && expenseDate <= end;
    });
  },

  getTotalExpenses: (expenses) => {
    const expenseList = expenses || get().expenses;
    return expenseList.reduce((total, expense) => total + expense.amount, 0);
  },

  getCategoryTotal: (category) => {
    const { expenses } = get();
    return expenses
      .filter((expense) => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  },

  getAllExpenses: () => {
    const { expenses } = get();
    return expenses;
  },
}));
