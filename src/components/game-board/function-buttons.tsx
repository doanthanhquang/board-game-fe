import { useEffect } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import {
  ArrowBack as LeftIcon,
  ArrowForward as RightIcon,
  KeyboardReturn as EnterIcon,
  ArrowBack as BackIcon,
  Help as HintIcon,
} from '@mui/icons-material';
import type { FunctionButtonsProps } from '@/types/board';

/**
 * FunctionButtons component - renders 5 function buttons with keyboard shortcuts
 */
export const FunctionButtons = ({
  onLeft,
  onRight,
  onEnter,
  onBack,
  onHint,
  disabled = {},
}: FunctionButtonsProps) => {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (!disabled.left && onLeft) {
            event.preventDefault();
            onLeft();
          }
          break;
        case 'ArrowRight':
          if (!disabled.right && onRight) {
            event.preventDefault();
            onRight();
          }
          break;
        case 'Enter':
          if (!disabled.enter && onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (!disabled.back && onBack) {
            event.preventDefault();
            onBack();
          }
          break;
        case 'h':
        case 'H':
          if (!disabled.hint && onHint) {
            event.preventDefault();
            onHint();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onLeft, onRight, onEnter, onBack, onHint, disabled]);

  const buttons = [
    {
      label: 'Left',
      icon: <LeftIcon />,
      onClick: onLeft,
      disabled: disabled.left,
      shortcut: '←',
      tooltip: 'Navigate left (Arrow Left)',
    },
    {
      label: 'Right',
      icon: <RightIcon />,
      onClick: onRight,
      disabled: disabled.right,
      shortcut: '→',
      tooltip: 'Navigate right (Arrow Right)',
    },
    {
      label: 'ENTER',
      icon: <EnterIcon />,
      onClick: onEnter,
      disabled: disabled.enter,
      shortcut: 'Enter',
      tooltip: 'Confirm selection (Enter)',
    },
    {
      label: 'Back',
      icon: <BackIcon />,
      onClick: onBack,
      disabled: disabled.back,
      shortcut: 'Esc',
      tooltip: 'Go back (Escape)',
    },
    {
      label: 'Hint/Help',
      icon: <HintIcon />,
      onClick: onHint,
      disabled: disabled.hint,
      shortcut: 'H',
      tooltip: 'Show hint or help (H)',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        flexWrap: 'wrap',
        mt: 3,
        mb: 2,
      }}
    >
      {buttons.map((button) => (
        <Tooltip key={button.label} title={button.tooltip}>
          <span>
            <Button
              variant="contained"
              startIcon={button.icon}
              onClick={button.onClick}
              disabled={button.disabled}
              sx={{
                minWidth: 120,
                textTransform: 'none',
              }}
            >
              {button.label}
            </Button>
          </span>
        </Tooltip>
      ))}
    </Box>
  );
};
