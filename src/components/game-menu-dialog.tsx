import { useState, useEffect, useRef } from 'react';
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
import { FunctionButtons } from '@/components/game-board';

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Menu items configuration
  const menuItems = [
    { id: 'continue', label: 'Continue', icon: PlayArrowIcon, disabled: true, action: null },
    { id: 'new-game', label: 'New Game', icon: RefreshIcon, disabled: false, action: 'newGame' },
    { id: 'instruction', label: 'Instruction', icon: HelpIcon, disabled: false, action: 'instruction' },
    { id: 'ranking', label: 'Ranking', icon: EmojiEventsIcon, disabled: true, action: null },
    { id: 'comment', label: 'Comment', icon: CommentIcon, disabled: true, action: null },
  ];

  // Reset selected index when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (open && menuItemsRef.current[selectedIndex]) {
      menuItemsRef.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex, open]);

  const handleNewGame = () => {
    if (game) {
      onNewGame(game.slug);
      onClose();
    }
  };

  const handleInstruction = () => {
    if (game) {
      onShowInstructions(game.instructions);
    }
  };

  const handleComingSoon = () => {
    // Show "Coming Soon" message - could be enhanced with a snackbar or alert
    console.log('Coming soon feature');
  };

  // Function button handlers
  const handleLeft = () => {
    // Not used in menu
  };

  const handleRight = () => {
    // Not used in menu
  };

  const handleEnter = () => {
    const item = menuItems[selectedIndex];
    if (item && !item.disabled) {
      if (item.action === 'newGame') {
        handleNewGame();
      } else if (item.action === 'instruction') {
        handleInstruction();
      }
    } else if (item?.disabled) {
      handleComingSoon();
    }
  };

  const handleBack = () => {
    onClose();
  };

  const handleHint = () => {
    // Show instructions
    if (game) {
      handleInstruction();
    }
  };

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
    const item = menuItems[index];
    if (item && !item.disabled) {
      if (item.action === 'newGame') {
        handleNewGame();
      } else if (item.action === 'instruction') {
        handleInstruction();
      }
    } else if (item?.disabled) {
      handleComingSoon();
    }
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
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isSelected = index === selectedIndex;
            const isDisabled = item.disabled;

            return (
              <Tooltip
                key={item.id}
                title={isDisabled ? 'Coming Soon' : ''}
                placement="right"
              >
                <span>
                  <ListItem
                    disablePadding
                    ref={(el) => {
                      menuItemsRef.current[index] = el;
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleItemClick(index)}
                      disabled={isDisabled}
                      selected={isSelected}
                      sx={{
                        borderRadius: 1,
                        mb: index < menuItems.length - 1 ? 0.5 : 0,
                        bgcolor: isSelected ? 'action.selected' : 'transparent',
                        '&:hover': {
                          bgcolor: isDisabled ? 'transparent' : 'action.hover',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'action.selected',
                          '&:hover': {
                            bgcolor: 'action.selected',
                          },
                        },
                      }}
                    >
                      <ListItemIcon>
                        <IconComponent color={isDisabled ? 'disabled' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={isDisabled ? 'Coming Soon' : ''}
                      />
                    </ListItemButton>
                  </ListItem>
                </span>
              </Tooltip>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <FunctionButtons
          onLeft={handleLeft}
          onRight={handleRight}
          onEnter={handleEnter}
          onBack={handleBack}
          onHint={handleHint}
          disabled={{
            left: true,
            right: true,
            enter: false,
            back: false,
            hint: false,
          }}
        />
        <Button onClick={onClose} variant="outlined" sx={{ ml: 2 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
