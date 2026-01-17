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
          Delete User
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
          Are you sure you want to delete this user?
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Username:</strong> {user.username}
            <br />
            <strong>Email:</strong> {user.email}
            <br />
            <strong>Role:</strong> {user.role}
          </Typography>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          This action will soft delete the user. The user will be hidden from the system but data
          will be preserved.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
