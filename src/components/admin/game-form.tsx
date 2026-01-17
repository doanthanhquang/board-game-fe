import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Game, UpdateGameConfigData } from '@/api/games';

interface GameFormProps {
  open: boolean;
  game: Game | null;
  onClose: () => void;
  onSubmit: (data: UpdateGameConfigData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

/**
 * Game form dialog component
 * Used for editing game configuration
 */
export const GameForm = ({
  open,
  game,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}: GameFormProps) => {
  const [formData, setFormData] = useState({
    default_board_width: 3,
    default_board_height: 3,
    default_time_limit: null as number | null,
    is_enabled: true,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data when game changes
  useEffect(() => {
    if (game) {
      setFormData({
        default_board_width: game.default_board_width,
        default_board_height: game.default_board_height,
        default_time_limit: game.default_time_limit,
        is_enabled: game.is_enabled,
      });
    }
    setValidationErrors({});
    // Reset form when dialog opens or game changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, open]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const width = Number(formData.default_board_width);
    if (Number.isNaN(width) || width < 3 || width > 50 || !Number.isInteger(width)) {
      errors.default_board_width = 'Board width must be an integer between 3 and 50';
    }

    const height = Number(formData.default_board_height);
    if (Number.isNaN(height) || height < 3 || height > 50 || !Number.isInteger(height)) {
      errors.default_board_height = 'Board height must be an integer between 3 and 50';
    }

    if (formData.default_time_limit !== null) {
      const timeLimit = Number(formData.default_time_limit);
      if (Number.isNaN(timeLimit) || timeLimit <= 0 || !Number.isInteger(timeLimit)) {
        errors.default_time_limit =
          'Time limit must be a positive integer (seconds) or empty for no limit';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      const submitData: UpdateGameConfigData = {
        default_board_width: Number(formData.default_board_width),
        default_board_height: Number(formData.default_board_height),
        default_time_limit:
          formData.default_time_limit === null ? null : Number(formData.default_time_limit),
        is_enabled: formData.is_enabled,
      };
      await onSubmit(submitData);
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

  const handleTimeLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '' || value === null) {
      setFormData((prev) => ({ ...prev, default_time_limit: null }));
    } else {
      const numValue = Number(value);
      setFormData((prev) => ({ ...prev, default_time_limit: isNaN(numValue) ? null : numValue }));
    }
    // Clear validation error
    if (validationErrors.default_time_limit) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.default_time_limit;
        return newErrors;
      });
    }
  };

  if (!game) {
    return null;
  }

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
          Edit Game: {game.name}
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Slug: {game.slug}
          </Typography>
          <TextField
            label="Board Width"
            type="number"
            value={formData.default_board_width}
            onChange={handleChange('default_board_width')}
            fullWidth
            required
            inputProps={{ min: 3, max: 50, step: 1 }}
            error={!!validationErrors.default_board_width}
            helperText={validationErrors.default_board_width || 'Between 3 and 50'}
            disabled={loading}
          />
          <TextField
            label="Board Height"
            type="number"
            value={formData.default_board_height}
            onChange={handleChange('default_board_height')}
            fullWidth
            required
            inputProps={{ min: 3, max: 50, step: 1 }}
            error={!!validationErrors.default_board_height}
            helperText={validationErrors.default_board_height || 'Between 3 and 50'}
            disabled={loading}
          />
          <TextField
            label="Time Limit (seconds)"
            type="number"
            value={formData.default_time_limit === null ? '' : formData.default_time_limit}
            onChange={handleTimeLimitChange}
            fullWidth
            inputProps={{ min: 1, step: 1 }}
            error={!!validationErrors.default_time_limit}
            helperText={validationErrors.default_time_limit || 'Leave empty for no time limit'}
            disabled={loading}
            placeholder="No limit"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_enabled}
                onChange={handleChange('is_enabled')}
                disabled={loading}
              />
            }
            label="Enabled"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
