import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpIcon from '@mui/icons-material/Help';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';
import type { Game } from '@/api/games';
import { FunctionButtons } from '@/components/game-board';

interface GameMenuDialogProps {
  open: boolean;
  game: Game | null;
  onClose: () => void;
  onNewGame: (slug: string) => void;
  onContinue: (slug: string) => void;
  canContinue: boolean;
  onShowInstructions: (instructions: string | null) => void;
  onShowRanking: () => void;
  onShowComments: () => void;
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
  onContinue,
  canContinue,
  onShowInstructions,
  onShowRanking,
  onShowComments,
}: GameMenuDialogProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuItemsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Menu items configuration
  const menuItems = [
    {
      id: 'continue',
      label: 'Tiếp tục',
      icon: PlayArrowIcon,
      disabled: !canContinue,
      action: 'continue',
    },
    { id: 'new-game', label: 'Ván mới', icon: RefreshIcon, disabled: false, action: 'newGame' },
    {
      id: 'instruction',
      label: 'Hướng dẫn',
      icon: HelpIcon,
      disabled: false,
      action: 'instruction',
    },
    { id: 'ranking', label: 'Xếp hạng', icon: EmojiEventsIcon, disabled: false, action: 'ranking' },
    {
      id: 'comment',
      label: 'Bình luận & đánh giá',
      icon: CommentIcon,
      disabled: false,
      action: 'comment',
    },
  ];

  // Reset selected index when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setSelectedIndex(0);
      }, 0);
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

  const handleContinue = () => {
    if (game) {
      onContinue(game.slug);
      onClose();
    }
  };

  const handleInstruction = () => {
    if (game) {
      onShowInstructions(game.instructions);
    }
  };

  const handleComments = () => {
    if (game) {
      onClose();
      onShowComments();
    }
  };

  const handleComingSoon = () => {
    // Placeholder for future features
  };

  // Function button handlers
  const handleLeft = () => {
    // Not used in menu
  };

  const handleRight = () => {
    // Not used in menu
  };

  const handleUp = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
  };

  const handleDown = () => {
    setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
  };

  const handleEnter = () => {
    const item = menuItems[selectedIndex];
    if (item && !item.disabled) {
      if (item.action === 'continue') {
        handleContinue();
      } else if (item.action === 'newGame') {
        handleNewGame();
      } else if (item.action === 'instruction') {
        handleInstruction();
      } else if (item.action === 'ranking') {
        if (game) {
          onClose();
          onShowRanking();
        }
      } else if (item.action === 'comment') {
        handleComments();
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
      if (item.action === 'continue') {
        handleContinue();
      } else if (item.action === 'newGame') {
        handleNewGame();
      } else if (item.action === 'instruction') {
        handleInstruction();
      } else if (item.action === 'ranking') {
        if (game) {
          onClose();
          onShowRanking();
        }
      } else if (item.action === 'comment') {
        handleComments();
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
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" component="div" fontWeight="bold">
          {game.name}
        </Typography>
        <IconButton aria-label="Close menu" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <List>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isSelected = index === selectedIndex;
            const isDisabled = item.disabled;

            return (
              <Tooltip key={item.id} title={isDisabled ? 'Sắp ra mắt' : ''} placement="right">
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
                      <ListItemText primary={item.label} />
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
          onUp={handleUp}
          onDown={handleDown}
          onEnter={handleEnter}
          onBack={handleBack}
          onHint={handleHint}
          disabled={{
            left: true,
            right: true,
            up: false,
            down: false,
            enter: false,
            back: false,
            hint: false,
          }}
        />
      </DialogActions>
    </Dialog>
  );
};
