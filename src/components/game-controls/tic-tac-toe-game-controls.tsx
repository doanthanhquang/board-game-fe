/**
 * Tic-Tac-Toe Game Controls Component
 */

import { Box, Typography, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';

interface TicTacToeGameControlsProps {
  statusMessage: string;
  isGameEnded: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export const TicTacToeGameControls = ({
  statusMessage,
  isGameEnded,
  saving,
  onSave,
  onReset,
}: TicTacToeGameControlsProps) => {
  return (
    <Box sx={{ mb: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        {statusMessage}
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          size="small"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : 'Lưu ván'}
        </Button>
      </Box>
      {isGameEnded && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={onReset}>
            New Game
          </Button>
        </Box>
      )}
    </Box>
  );
};
