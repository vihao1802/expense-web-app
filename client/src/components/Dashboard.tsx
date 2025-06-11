import React, { useEffect, useCallback, useMemo } from "react";
import { Box, Alert, Skeleton } from "@mui/material";
import dayjs from "dayjs";

import SummaryCards from "./dashboard/SummaryCards";
import ExpenseCharts from "./dashboard/ExpenseCharts";

import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import ExpenseHistory from "./dashboard/ExpenseHistory";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    expenses,
    isLoading,
    error: expensesError,
    monthlySummary = [],
    refetchExpenses,
  } = useExpenses();

  // Get current date values
  const now = dayjs();
  const currentMonth = now.month() + 1;
  const currentYear = now.year();

  const loading = isLoading;
  const error = expensesError;

  // Process monthly summary for the chart
  const monthlyData = useMemo(
    () =>
      monthlySummary.map((item) => ({
        name: new Date(currentYear, item.month - 1).toLocaleString("vi-VN", {
          month: "short",
        }),
        amount: item.total,
      })),
    [monthlySummary, currentYear]
  );

  // Get monthly expenses from the context's monthlySummary
  const monthlyExpenses = useMemo(() => {
    const expenses = Array(12).fill(0);
    monthlySummary.forEach((item) => {
      expenses[item.month - 1] = item.total;
    });
    return expenses;
  }, [monthlySummary]);

  // Calculate totals
  const totalExpenses = React.useMemo(
    () => expenses.reduce((sum, exp) => sum + exp.amount, 0),
    [expenses]
  );

  // Calculate current month expenses
  const currentMonthExpenses = React.useMemo(
    () =>
      expenses.filter((expense) => {
        const date = dayjs(expense.expense_date);
        return date.month() + 1 === currentMonth && date.year() === currentYear;
      }),
    [expenses, currentMonth, currentYear]
  );

  // Calculate current year expenses
  const currentYearExpenses = React.useMemo(
    () =>
      expenses.filter((expense) => {
        const date = dayjs(expense.expense_date);
        return date.year() === currentYear;
      }),
    [expenses, currentYear]
  );
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;

      try {
        await refetchExpenses();
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [user?._id, refetchExpenses]);

  // Calculate tag totals for pie chart - used in ExpenseCharts component
  const getTagColor = useCallback((tag: string) => {
    const colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffc107",
      "#ff9800",
      "#ff5722",
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const tagTotals = React.useMemo(
    () =>
      expenses.reduce<
        Record<string, { name: string; value: number; color: string }>
      >((acc, item) => {
        if (item.tag) {
          const tagName = item.tag.name;
          if (!acc[tagName]) {
            acc[tagName] = {
              name: tagName,
              value: 0,
              color: item.tag.color || getTagColor(tagName),
            };
          }
          acc[tagName].value += item.amount;
        }
        return acc;
      }, {}),
    [expenses, getTagColor]
  );

  // Convert tagTotals to array for charts
  const chartData = React.useMemo(
    () => Object.values(tagTotals).sort((a, b) => b.value - a.value),
    [tagTotals]
  );

  // Calculate totals from filtered expenses
  const currentMonthTotal = React.useMemo(
    () => currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    [currentMonthExpenses]
  );

  const currentYearTotal = React.useMemo(
    () => currentYearExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    [currentYearExpenses]
  );

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  return (
    <Box sx={{ p: { xs: "12px 0", sm: 3 } }}>
      {/* Summary Cards */}
      <SummaryCards
        totalExpenses={totalExpenses}
        currentMonthTotal={currentMonthTotal}
        currentYearTotal={currentYearTotal}
        currentYear={currentYear}
      />

      {/* Expense Charts */}
      <ExpenseCharts
        monthlyData={monthlyData}
        monthlyExpenses={monthlyExpenses}
        chartData={chartData}
        loading={loading}
        error={error}
      />

      {/* Expense History */}
      <ExpenseHistory
        expenses={expenses}
        rowsPerPageOptions={[5, 10, 25]}
        defaultRowsPerPage={5}
        title="Chi tiêu gần đây"
        emptyMessage="Không tìm thấy giao dịch"
      />
    </Box>
  );
};

export default Dashboard;
