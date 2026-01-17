/**
 * Match-3 and Memory Game Controls Component
 */

import { Box, Typography, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Match3MemoryGameControlsProps {
  statusMessage: string;
  isGameEnded: boolean;
  saving: boolean;
  saveError: string | null;
  onSave: () => void;
  onReset: () => void;
  onBackToDashboard: () => void;
}

export const Match3MemoryGameControls = ({
  statusMessage,
  isGameEnded,
  saving,
  saveError,
  onSave,
  onReset,
  onBackToDashboard,
}: Match3MemoryGameControlsProps) => {
  return (
    <Box sx={{ mb: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        {statusMessage}
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
        {!isGameEnded && (
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            size="small"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu ván'}
          </Button>
        )}
        <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={onReset}>
          Reset
        </Button>
        {isGameEnded && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={onBackToDashboard}
          >
            Quay lại
          </Button>
        )}
      </Box>
      {saveError && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {saveError}
        </Typography>
      )}
    </Box>
  );
};
