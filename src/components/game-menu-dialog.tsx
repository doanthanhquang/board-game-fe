import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpIcon from '@mui/icons-material/Help';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CommentIcon from '@mui/icons-material/Comment';
import type { Game } from '@/api/games';

interface GameMenuDialogProps {
  open: boolean;
  game: Game | null;
  onClose: () => void;
  onNewGame: (slug: string) => void;
  onShowInstructions: (instructions: string | null) => void;
}

/**
 * Game menu dialog component
 * Displays menu options when clicking on a game card
 */
export const GameMenuDialog = ({
  open,
  game,
  onClose,
  onNewGame,
  onShowInstructions,
}: GameMenuDialogProps) => {
  const handleNewGame = () => {
    if (game) {
      onNewGame(game.slug);
      onClose();
    }
  };

  const handleInstruction = () => {
    if (game) {
      onShowInstructions(game.instructions);
      onClose();
    }
  };

  const handleComingSoon = () => {
    // Show "Coming Soon" message - could be enhanced with a snackbar or alert
    console.log('Coming soon feature');
  };

  if (!game) {
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
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight="bold">
          {game.name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <List>
          {/* Continue - Coming Soon */}
          <Tooltip title="Coming Soon" placement="right">
            <span>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleComingSoon}
                  disabled
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon>
                    <PlayArrowIcon />
                  </ListItemIcon>
                  <ListItemText primary="Continue" secondary="Coming Soon" />
                </ListItemButton>
              </ListItem>
            </span>
          </Tooltip>

          {/* New Game */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleNewGame}
              sx={{
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon>
                <RefreshIcon />
              </ListItemIcon>
              <ListItemText primary="New Game" />
            </ListItemButton>
          </ListItem>

          {/* Instruction */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleInstruction}
              sx={{
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Instruction" />
            </ListItemButton>
          </ListItem>

          {/* Ranking - Coming Soon */}
          <Tooltip title="Coming Soon" placement="right">
            <span>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleComingSoon}
                  disabled
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon>
                    <EmojiEventsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Ranking" secondary="Coming Soon" />
                </ListItemButton>
              </ListItem>
            </span>
          </Tooltip>

          {/* Comment - Coming Soon */}
          <Tooltip title="Coming Soon" placement="right">
            <span>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleComingSoon}
                  disabled
                  sx={{
                    borderRadius: 1,
                  }}
                >
                  <ListItemIcon>
                    <CommentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Comment" secondary="Coming Soon" />
                </ListItemButton>
              </ListItem>
            </span>
          </Tooltip>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
