import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { GameStatus } from '@/types/game-state';

interface GameResultDialogProps {
  open: boolean;
  gameStatus: GameStatus;
  onClose: () => void;
  onNewGame?: () => void;
  gameName?: string;
  score?: number;
}

/**
 * Common dialog component for displaying game results
 * Can be reused for all games
 */
export const GameResultDialog = ({
  open,
  gameStatus,
  onClose,
  onNewGame,
  gameName = 'Trò chơi',
  score,
}: GameResultDialogProps) => {
  const isGameEnded = gameStatus !== 'playing';

  if (!isGameEnded) {
    return null;
  }

  const getResultContent = () => {
    switch (gameStatus) {
      case 'player-won':
        return {
          title: '🎉 Chiến thắng!',
          message: 'Bạn đã chiến thắng!',
          icon: <CelebrationIcon sx={{ fontSize: 80, color: 'success.main' }} />,
          color: 'success',
        };
      case 'computer-won':
        return {
          title: '😔 Thất bại',
          message: 'Bạn đã thua!',
          icon: <SentimentVeryDissatisfiedIcon sx={{ fontSize: 80, color: 'error.main' }} />,
          color: 'error',
        };
      case 'draw':
        return {
          title: '🤝 Hòa',
          message: 'Trận đấu kết thúc với kết quả hòa!',
          icon: <EmojiEventsIcon sx={{ fontSize: 80, color: 'warning.main' }} />,
          color: 'warning',
        };
      default:
        return null;
    }
  };

  const result = getResultContent();

  if (!result) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          textAlign: 'center',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h4" component="div" fontWeight="bold">
          {result.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 2,
          }}
        >
          {result.icon}
          <Typography variant="h6" component="div" color="text.secondary">
            {result.message}
          </Typography>
          {gameName && (
            <Typography variant="body2" color="text.secondary">
              {gameName}
            </Typography>
          )}
          {gameStatus === 'player-won' && typeof score === 'number' && score > 0 && (
            <Typography variant="h6" color="success.main">
              Điểm của bạn: {score}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        {onNewGame && (
          <Button
            variant="contained"
            color={result.color as 'success' | 'error' | 'warning'}
            onClick={() => {
              onNewGame();
              onClose();
            }}
            size="large"
            sx={{ minWidth: 120 }}
          >
            Chơi lại
          </Button>
        )}
        <Button variant="outlined" onClick={onClose} size="large" sx={{ minWidth: 120 }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};
