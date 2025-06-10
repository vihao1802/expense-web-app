import type { Tag } from '@/types/tag';

export interface Expense {
  _id: string;
  id?: string; // For backward compatibility
  amount: number;
  desc: string;
  expense_date: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
  account_id: string;
  deleted?: boolean;
  tag?: Tag;
}

export interface MonthlySummary {
  month: number;
  year: number;
  total: number;
  count: number;
}

export type CreateExpenseData = Omit<Expense, '_id' | 'created_at' | 'updated_at'>;

export type UpdateExpenseData = Partial<Omit<Expense, '_id' | 'created_at' | 'updated_at' | 'tag'>> & { 
  tagId?: string 
};
