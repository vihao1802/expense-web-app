import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  Skeleton,
  Alert,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { Expense } from '../../types/expense';

interface TransactionHistoryProps {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  expenses,
  loading,
  error,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <Skeleton variant="rectangular" height={300} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Lịch sử giao dịch
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Nhãn</TableCell>
              <TableCell align="right">Số tiền</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((expense) => (
                <TableRow key={expense._id} hover>
                  <TableCell>
                    {dayjs(expense.expense_date).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>{expense.desc}</TableCell>
                  <TableCell>
                    {expense.tag?.name || 'Không nhãn'}
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      component="span"
                      sx={{
                        color: 'error.main',
                        fontWeight: 'medium',
                      }}
                    >
                      {formatVND(expense.amount)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={expenses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng mỗi trang:"
      />
    </Paper>
  );
};

export default TransactionHistory;
