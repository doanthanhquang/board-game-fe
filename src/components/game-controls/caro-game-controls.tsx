/**
 * Caro Game Controls Component
 */

import { Box, Typography, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface CaroGameControlsProps {
  statusMessage: string;
  playerScore: number;
  isGameEnded: boolean;
  saving: boolean;
  saveError: string | null;
  onSave: () => void;
  onNewGame: () => void;
  onBackToDashboard: () => void;
}

export const CaroGameControls = ({
  statusMessage,
  playerScore,
  isGameEnded,
  saving,
  saveError,
  onSave,
  onNewGame,
  onBackToDashboard,
}: CaroGameControlsProps) => {
  return (
    <Box sx={{ mb: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        {statusMessage}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Điểm hiện tại: {playerScore}
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

        {isGameEnded && (
          <>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={onNewGame}>
              New Game
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={onBackToDashboard}
            >
              Quay lại
            </Button>
          </>
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
