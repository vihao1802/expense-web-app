import axiosInstance from '@/config/axios';
import type { Expense, MonthlySummary, UpdateExpenseData } from '@/types/expense';

export const expenseService = {
  // Get all expenses with optional filters
  getExpenses: async (params: {
    skip?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    tagId?: string;
  } = {}) => {
    const response = await axiosInstance.get<Expense[]>(
      '/expenses/me', 
      { 
        params: {
          skip: params?.skip,
          limit: params?.limit,
          start_date: params?.startDate?.toISOString(),
          end_date: params?.endDate?.toISOString(),
          tag_id: params?.tagId
        },
        paramsSerializer: (params) => {
          // Custom params serializer to handle undefined values
          const result = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              result.append(key, value.toString());
            }
          });
          return result.toString();
        }
      }
    );
    
    return response.data;
  },

  // Get current month's expenses
  getCurrentMonthExpenses: async (params: { skip?: number; limit?: number } = {}) => {
    const response = await axiosInstance.get<Expense[]>(
      '/expenses/me/current-month',
      { params: { skip: params?.skip || 0, limit: params?.limit || 100 } }
    );
    return response.data;
  },

  // Get current year's expenses
  getCurrentYearExpenses: async (params: { skip?: number; limit?: number } = {}) => {
    const response = await axiosInstance.get<Expense[]>(
      '/expenses/me/current-year',
      { params: { skip: params?.skip || 0, limit: params?.limit || 100 } }
    );
    return response.data;
  },

  // Get expenses by tag ID
  getExpensesByTag: async (tagId: string, params: { skip?: number; limit?: number } = {}) => {
    const response = await axiosInstance.get<Expense[]>(
      `/expenses/me/by-tag/${encodeURIComponent(tagId)}`,
      { params: { skip: params?.skip || 0, limit: params?.limit || 100 } }
    );
    return response.data;
  },

  // Get monthly summary for charts
  getMonthlySummary: async (year?: number) => {
    const response = await axiosInstance.get<MonthlySummary[]>(
      '/expenses/me/monthly-summary',
      { params: { year } }
    );
    return response.data;
  },

  // Create new expense
  createExpense: async (expense: Omit<Expense, '_id' | 'created_at' | 'updated_at'>) => {
    const response = await axiosInstance.post<Expense>('/expenses', expense);
    return response.data;
  },

  // Update existing expense
  updateExpense: async (id: string, expense: Partial<UpdateExpenseData>) => {
    const response = await axiosInstance.put<Expense>(`/expenses/${id}`, expense);
    return response.data;
  },

  // Delete expense (soft delete)
  deleteExpense: async (id: string) => {
    const response = await axiosInstance.delete(`/expenses/${id}`);
    return response.data;
  }
};

export type { MonthlySummary };
