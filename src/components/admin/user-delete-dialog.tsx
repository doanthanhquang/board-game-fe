import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from '@/api/users';

interface UserDeleteDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

/**
 * User delete confirmation dialog component
 */
export const UserDeleteDialog = ({
  open,
  user,
  onClose,
  onConfirm,
  loading = false,
  error = null,
}: UserDeleteDialogProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (err) {
      // Error handling is done by parent
      console.error('Delete confirmation error:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold">
          Xóa người dùng
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body1" paragraph>
          Bạn chắc chắn muốn xóa người dùng này?
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Tên đăng nhập:</strong> {user.username}
            <br />
            <strong>Email:</strong> {user.email}
            <br />
            <strong>Vai trò:</strong> {user.role}
          </Typography>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          Hành động này sẽ xóa mềm người dùng. Người dùng sẽ bị ẩn khỏi hệ thống nhưng dữ liệu sẽ
          được bảo tồn.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading}>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
};
