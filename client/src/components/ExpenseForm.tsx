import { Button, Paper } from "@mui/material";
import AmountTextField from "./AmountTextField";
import TagSelector from "./TagSelector";
import React, { useState } from "react";
import { TextField, CircularProgress, Snackbar, Alert } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import DoneIcon from "@mui/icons-material/Done";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/contexts/ExpenseContext";

interface ExpenseFormProps {
  onExpenseAdded?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onExpenseAdded }) => {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { user } = useAuth();
  const { createExpense, refetchExpenses } = useExpenses();

  // Reset form fields
  const resetForm = () => {
    setAmount("");
    setNote("");
    setSelectedDate(dayjs());
    setSelectedTagId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!amount || !selectedDate || !selectedTagId) {
      setError("Vui lòng điền đầy đủ thông tin và chọn danh mục");
      return;
    }

    if (!user?._id) {
      setError("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    if (!user) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const expenseData = {
        amount: parseFloat(amount),
        desc: note,
        tagId: selectedTagId,
        expense_date: selectedDate.toISOString(),
        account_id: user._id,
      };

      const response = await createExpense(expenseData);

      if (response) {
        setSuccess(true);
        resetForm();
        if (onExpenseAdded) {
          onExpenseAdded();
        }
        await refetchExpenses();
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Có lỗi xảy ra khi thêm chi tiêu. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <h2 className="text-lg font-semibold mb-6 text-gray-800 text-left">
        Thêm chi tiêu mới
      </h2>
      <Snackbar
        open={!!error || success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {success ? "Thêm chi tiêu thành công!" : error}
        </Alert>
      </Snackbar>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="amount"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Số tiền <span className="text-red-500">*</span>
          </label>
          <AmountTextField
            value={amount}
            onAmountChange={(amount) => setAmount(amount.toString())}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Loại chi tiêu <span className="text-red-500">*</span>
          </label>
          <div className="mb-2">
            <TagSelector
              value={selectedTagId}
              onChange={(tagId) => {
                setSelectedTagId(tagId);
                // Clear error when user selects a tag
                if (tagId && error?.includes("danh mục")) {
                  setError(null);
                }
              }}
            />
            {!selectedTagId && error?.includes("danh mục") && (
              <p className="text-red-500 text-xs mt-1">
                Vui lòng chọn loại chi tiêu
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Ngày chi tiêu <span className="text-red-500">*</span>
          </label>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={(newValue: Dayjs | null) => setSelectedDate(newValue)}
            />
          </LocalizationProvider>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Ghi chú
          </label>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Nhập ghi chú nếu có..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            variant="outlined"
          />
        </div>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            padding: "8px 24px",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "1rem",
            textTransform: "none",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            "&:disabled": {
              backgroundColor: "#e0e0e0",
              color: "#9e9e9e",
            },
          }}
          endIcon={
            isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <DoneIcon />
            )
          }
        >
          {isSubmitting ? "Đang thêm..." : "Thêm ngay"}
        </Button>
      </form>
    </Paper>
  );
};

export default ExpenseForm;
