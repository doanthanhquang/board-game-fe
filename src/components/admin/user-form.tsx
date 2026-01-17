import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { User, CreateUserData, UpdateUserData } from '@/api/users';

interface UserFormProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

/**
 * User form dialog component
 * Used for both creating and editing users
 */
export const UserForm = ({
  open,
  user,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}: UserFormProps) => {
  const initialFormData = user
    ? {
        email: user.email,
        username: user.username,
        password: '', // Password not editable
        role: user.role,
        is_active: true,
      }
    : {
        email: '',
        username: '',
        password: '',
        role: 'client' as 'client' | 'admin',
        is_active: true,
      };

  const [formData, setFormData] = useState(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEditMode = !!user;

  // Reset form data when user or dialog open state changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        password: '', // Password not editable
        role: user.role,
        is_active: true,
      });
    } else {
      setFormData({
        email: '',
        username: '',
        password: '',
        role: 'client',
        is_active: true,
      });
    }
    setValidationErrors({});
    // Reset form when dialog opens or user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, open]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập là bắt buộc';
    }

    if (!isEditMode && !formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (!isEditMode && formData.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      if (isEditMode) {
        // For edit, exclude password
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...updateData } = formData;
        await onSubmit(updateData);
      } else {
        // For create, include password
        await onSubmit(formData);
      }
    } catch (err) {
      // Error handling is done by parent
      console.error('Form submission error:', err);
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth key={user?.id || 'new'}>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold">
          {isEditMode ? 'Sửa người dùng' : 'Tạo người dùng'}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            fullWidth
            required
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            disabled={loading}
          />
          <TextField
            label="Tên đăng nhập"
            value={formData.username}
            onChange={handleChange('username')}
            fullWidth
            required
            error={!!validationErrors.username}
            helperText={validationErrors.username}
            disabled={loading}
          />
          {!isEditMode && (
            <TextField
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              fullWidth
              required
              error={!!validationErrors.password}
              helperText={validationErrors.password || 'Ít nhất 8 ký tự'}
              disabled={loading}
            />
          )}
          <FormControl fullWidth>
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={formData.role}
              label="Vai trò"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value as 'client' | 'admin' }))
              }
              disabled={loading}
            >
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {isEditMode ? 'Cập nhật' : 'Tạo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
