import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { expenseService } from '@/services/expense';
import type { Expense } from '@/types/expense';
import type { CreateExpenseData, UpdateExpenseData, MonthlySummary } from '@/types/expense';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  error: Error | null;
  monthlySummary: MonthlySummary[];
  createExpense: (data: CreateExpenseData) => Promise<Expense>;
  updateExpense: (id: string, data: UpdateExpenseData) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  refetchExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);



  // Fetch all expenses
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch expenses');
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch monthly summary
  const fetchMonthlySummary = useCallback(async () => {
    try {
      const summary = await expenseService.getMonthlySummary();
      setMonthlySummary(summary);
      return summary;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch monthly summary');
      setError(error);
      return [];
    }
  }, []);

  // Refresh data
  const refetchExpenses = useCallback(async () => {
    await Promise.all([
      fetchExpenses(),
      fetchMonthlySummary()
    ]);
  }, [fetchExpenses, fetchMonthlySummary]);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchExpenses(),
        fetchMonthlySummary()
      ]);
    };
    loadData();
  }, [fetchExpenses, fetchMonthlySummary]);

  // Create expense
  const createExpense = useCallback(async (data: CreateExpenseData) => {
    setIsLoading(true);
    try {
      const newExpense = await expenseService.createExpense(data);
      setExpenses(prev => [...prev, newExpense]);
      await refetchExpenses();
      return newExpense;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create expense');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refetchExpenses]);

  // Update expense
  const updateExpense = useCallback(async (id: string, data: UpdateExpenseData) => {
    setIsLoading(true);
    try {
      const updatedExpense = await expenseService.updateExpense(id, data);
      setExpenses(prev => prev.map(exp => 
        exp._id === id ? { ...exp, ...updatedExpense } : exp
      ));
      await refetchExpenses();
      return updatedExpense;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update expense');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refetchExpenses]);

  // Delete expense
  const deleteExpense = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await expenseService.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp._id !== id));
      await refetchExpenses();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete expense');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refetchExpenses]);



  const value = {
    expenses,
    isLoading,
    error,
    monthlySummary,
    createExpense,
    updateExpense,
    deleteExpense,
    refetchExpenses,
    fetchExpenses,
    fetchMonthlySummary
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

