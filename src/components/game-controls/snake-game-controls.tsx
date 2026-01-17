/**
 * Snake Game Controls Component
 */

import { Box, Typography, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface SnakeGameControlsProps {
  statusMessage: string;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  saving: boolean;
  saveError: string | null;
  onSave: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onBackToDashboard: () => void;
}

export const SnakeGameControls = ({
  statusMessage,
  score,
  isGameOver,
  isPaused,
  saving,
  saveError,
  onSave,
  onPause,
  onResume,
  onReset,
  onBackToDashboard,
}: SnakeGameControlsProps) => {
  return (
    <Box sx={{ mb: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        {statusMessage}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Điểm hiện tại: {score}
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
        {!isGameOver && (
          <Button
            variant={isPaused ? 'contained' : 'outlined'}
            color={isPaused ? 'primary' : 'inherit'}
            startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            size="small"
            onClick={isPaused ? onResume : onPause}
          >
            {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          </Button>
        )}
        <Button
          variant={isPaused ? 'contained' : 'outlined'}
          color={isPaused ? 'success' : 'inherit'}
          startIcon={<SaveIcon />}
          size="small"
          onClick={onSave}
          disabled={saving || isGameOver}
        >
          {saving ? 'Đang lưu...' : 'Lưu ván'}
        </Button>
        <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={onReset}>
          Reset
        </Button>
        {isGameOver && (
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
