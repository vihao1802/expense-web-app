import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  TablePagination, 
  Paper, 
  Chip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Expense as ExpenseType, UpdateExpenseData } from '@/types/expense';
import type { Tag } from '@/types/tag';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useTags } from '@/contexts/TagContext';
import AmountTextField from '../AmountTextField';
import { getTagColor } from '@/utils/get_tag_color';

interface ExpenseHistoryProps {
  expenses: ExpenseType[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  title?: string;
  emptyMessage?: string;
  onExpenseUpdate?: (updatedExpense: ExpenseType) => void;
  onExpenseDelete?: (expenseId: string) => void;
}

interface Expense extends Omit<ExpenseType, 'expense_date'> {
  expense_date: string | Date;
}

const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 5,
  title = 'Chi tiêu gần đây',
  emptyMessage = 'Không tìm thấy giao dịch',
  onExpenseUpdate,
  onExpenseDelete
}) => {
  const { tags } = useTags();
  const { updateExpense, deleteExpense } = useExpenses();
  
  // Filter out deleted tags and ensure they have required properties
  const availableTags = useMemo(() => 
    (tags || []).filter((tag: Tag) => !tag.deleted)
      .map(tag => ({
        _id: tag._id,
        name: tag.name,
        color: tag.color || getTagColor(tag.name),
        account_id: tag.account_id,
        created_at: tag.created_at,
        updated_at: tag.updated_at,
        deleted: tag.deleted
      })),
    [tags]
  );
  
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<ExpenseType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const handleOpenEdit = (expense: ExpenseType) => {
    setCurrentExpense(expense);
    setOpenEditModal(true);
  };

  const handleCloseEdit = () => {
    setOpenEditModal(false);
    setCurrentExpense(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentExpense) return;
    
    const { name, value } = e.target;
    setCurrentExpense({
      ...currentExpense,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    });
  };

  const handleTagChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    if (!currentExpense) return;
    
    const tagId = e.target.value as string;
    const selectedTag = availableTags.find((tag: Tag) => tag._id === tagId);
    
    if (selectedTag) {
      setCurrentExpense({
        ...currentExpense,
        tag: selectedTag
      });
    } else {
      // If no tag is selected, set tag to null
      const { tag, ...rest } = currentExpense;
      setCurrentExpense(rest as ExpenseType);
    }
  };

  const handleUpdateExpense = async () => {
    if (!currentExpense) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updateData: UpdateExpenseData = {
        amount: currentExpense.amount,
        desc: currentExpense.desc,
        expense_date: currentExpense.expense_date,
        tagId: currentExpense.tag?._id,
      };
      
      const updatedExpense = await updateExpense(currentExpense._id, updateData);
      
      onExpenseUpdate?.(updatedExpense);
      handleCloseEdit();
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật chi tiêu');
      console.error('Error updating expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    
    try {
      setLoading(true);
      await deleteExpense(expenseToDelete);
      onExpenseDelete?.(expenseToDelete);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa chi tiêu');
      console.error('Error deleting expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedExpenses = useMemo<Expense[]>(() => {
    return expenses.map(expense => ({
      ...expense,
      expense_date: typeof expense.expense_date === 'string' 
        ? expense.expense_date 
        : expense.expense_date.toISOString()
    })).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [expenses, page, rowsPerPage]);

  if (expenses.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography color="textSecondary" align="center" sx={{ p: 2 }}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Số tiền</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedExpenses.map((expense, index) => (
              <TableRow key={expense._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expense.amount)}
                </TableCell>
                <TableCell>{dayjs(expense.expense_date).format('dddd, DD/MM/YYYY')}</TableCell>
                <TableCell>
                  {expense.tag ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    <Chip
                      key={expense.tag._id}
                      label={expense.tag.name}
                      size="small"
                      sx={{
                        bgcolor: `${expense.tag.color || getTagColor(expense.tag.name)}15`,
                        color: expense.tag.color || getTagColor(expense.tag.name),
                        border: `1px solid ${expense.tag.color || getTagColor(expense.tag.name)}`,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  </Box>
                  ) : 'Không có loại'}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body1" component="div">
                      {expense.desc}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                    <IconButton 
                      onClick={() => handleOpenEdit(expense)}
                      disabled={loading}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteExpense(expense._id)}
                      disabled={loading}
                    >
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={expenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong ${count} bản ghi`
          }
          sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
        />
      </TableContainer>

      {/* Edit Expense Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa chi tiêu</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {currentExpense && (
            <Box component="form" sx={{ mt: 1 }}>
              <AmountTextField 
                label="Số tiền"
                value={currentExpense.amount.toString()}
                onAmountChange={(amount) => setCurrentExpense({ ...currentExpense, amount })}
              />
              <TextField
                margin="normal"
                fullWidth
                name="desc"
                label="Mô tả"
                value={currentExpense.desc || ''}
                onChange={handleInputChange}
              />
              
              <TextField
                margin="normal"
                fullWidth
                name="expense_date"
                label="Ngày chi tiêu"
                type="date"
                value={dayjs(currentExpense.expense_date).format('YYYY-MM-DD')}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                select
                margin="normal"
                fullWidth
                name="tag"
                label="Loại"
                value={currentExpense.tag?._id || ''}
                onChange={handleTagChange}
              >
                {availableTags.map((tag: Tag) => (
                  <MenuItem key={tag._id} value={tag._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: tag.color || getTagColor(tag.name),
                        }}
                      />
                      {tag.name}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateExpense} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa chi tiêu này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDeleteExpense}
            color="error"
            variant="contained"
            disabled={loading || !expenseToDelete}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Đang xử lý...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseHistory;