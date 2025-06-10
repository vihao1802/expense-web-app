import { useState, useCallback } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { useTags } from "@/contexts/TagContext";

const TagList = () => {
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<{
    _id: string;
    name: string;
    color?: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { tags, loading, error, createTag, updateTag, deleteTag } = useTags();

  // Get refetchExpenses from ExpenseContext
  const { refetchExpenses } = useExpenses();

  // Handle creating a new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createTag(newTagName.trim());
      setNewTagName("");
      // Refresh expenses to reflect the new tag
      await refetchExpenses();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi tạo loại chi tiêu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating a tag
  const handleUpdateTag = useCallback(async () => {
    if (!editingTag || !editingTag.name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await updateTag(editingTag._id, {
        name: editingTag.name.trim(),
        color: editingTag.color,
      });
      setEditingTag(null);
      // Refresh expenses to reflect the updated tag
      await refetchExpenses();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật loại chi tiêu");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingTag, isSubmitting, updateTag, refetchExpenses]);

  // Handle delete confirmation dialog
  const handleDeleteClick = useCallback((tagId: string) => {
    setTagToDelete(tagId);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setTagToDelete(null);
  }, []);

  // Handle tag deletion
  const handleDeleteTag = useCallback(async () => {
    if (!tagToDelete || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await deleteTag(tagToDelete);
      setDeleteDialogOpen(false);
      setTagToDelete(null);
      // Refresh expenses to reflect the deleted tag
      await refetchExpenses();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi xóa loại chi tiêu");
    } finally {
      setIsSubmitting(false);
    }
  }, [tagToDelete, deleteTag, refetchExpenses, isSubmitting]);

  // Loading state
  if (loading) {
    return (
      <Stack spacing={1} width="100%">
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Quản lý loại chi tiêu
      </Typography>

      {/* Add new tag form */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTag();
        }}
      >
        <Stack direction="row" spacing={1} mb={2}>
          <TextField
            size="small"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tên loại chi tiêu mới..."
            fullWidth
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || !newTagName.trim()}
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : <AddIcon />
            }
          >
            Thêm
          </Button>
        </Stack>
      </Box>

      {/* Tags list */}
      <List>
        {tags.length === 0 ? (
          <Typography variant="body2" color="textSecondary" align="center">
            Chưa có loại chi tiêu nào
          </Typography>
        ) : (
          tags.map((tag) => (
            <ListItem
              key={tag._id}
              secondaryAction={
                <>
                  <IconButton
                    edge="end"
                    onClick={() =>
                      setEditingTag({
                        _id: tag._id,
                        name: tag.name,
                        color: tag.color,
                      })
                    }
                    disabled={isSubmitting}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteClick(tag._id)}
                    disabled={isSubmitting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText>
                <Typography
                  variant="body1"
                  color={tag.color ? "primary" : "inherit"}
                  sx={tag.color ? { color: tag.color } : {}}
                >
                  {tag.name}
                </Typography>
              </ListItemText>
            </ListItem>
          ))
        )}
      </List>

      {/* Edit tag dialog */}
      <Dialog
        open={!!editingTag}
        onClose={() => setEditingTag(null)}
        fullWidth
        maxWidth="sm"
        disableEnforceFocus
        disableAutoFocus
        disableScrollLock
      >
        <DialogTitle>Chỉnh sửa loại chi tiêu</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Tên loại chi tiêu"
              fullWidth
              value={editingTag?.name || ""}
              required
              onChange={(e) =>
                editingTag &&
                setEditingTag({ ...editingTag, name: e.target.value })
              }
            />
            {/* Color picker */}
            <TextField
              margin="dense"
              label="Màu sắc"
              fullWidth
              value={editingTag?.color || ""}
              onChange={(e) =>
                editingTag &&
                setEditingTag({ ...editingTag, color: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingTag(null)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleUpdateTag}
            variant="contained"
            disabled={!editingTag?.name.trim() || isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa loại chi tiêu này? Thao tác này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteTag}
            color="error"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? "Đang xử lý..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TagList;
