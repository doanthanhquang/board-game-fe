import { useEffect } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import {
  ArrowBack as LeftIcon,
  ArrowForward as RightIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  KeyboardReturn as EnterIcon,
  ArrowBack as BackIcon,
  Help as HintIcon,
} from '@mui/icons-material';
import type { FunctionButtonsProps } from '@/types/board';

/**
 * FunctionButtons component - renders 7 function buttons with keyboard shortcuts
 */
export const FunctionButtons = ({
  onLeft,
  onRight,
  onUp,
  onDown,
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
        case 'ArrowUp':
          if (!disabled.up && onUp) {
            event.preventDefault();
            onUp();
          }
          break;
        case 'ArrowDown':
          if (!disabled.down && onDown) {
            event.preventDefault();
            onDown();
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
  }, [onLeft, onRight, onUp, onDown, onEnter, onBack, onHint, disabled]);

  const buttons = [
    {
      label: 'Trái',
      icon: <LeftIcon />,
      onClick: onLeft,
      disabled: disabled.left,
      shortcut: '←',
      tooltip: 'Di chuyển sang trái (Phím mũi tên trái)',
    },
    {
      label: 'Phải',
      icon: <RightIcon />,
      onClick: onRight,
      disabled: disabled.right,
      shortcut: '→',
      tooltip: 'Di chuyển sang phải (Phím mũi tên phải)',
    },
    {
      label: 'Lên',
      icon: <UpIcon />,
      onClick: onUp,
      disabled: disabled.up,
      shortcut: '↑',
      tooltip: 'Di chuyển lên (Phím mũi tên lên)',
    },
    {
      label: 'Xuống',
      icon: <DownIcon />,
      onClick: onDown,
      disabled: disabled.down,
      shortcut: '↓',
      tooltip: 'Di chuyển xuống (Phím mũi tên xuống)',
    },
    {
      label: 'ENTER',
      icon: <EnterIcon />,
      onClick: onEnter,
      disabled: disabled.enter,
      shortcut: 'Enter',
      tooltip: 'Xác nhận lựa chọn (Phím Enter)',
    },
    {
      label: 'Quay lại',
      icon: <BackIcon />,
      onClick: onBack,
      disabled: disabled.back,
      shortcut: 'Esc',
      tooltip: 'Quay lại (Phím Escape)',
    },
    {
      label: 'Gợi ý/Trợ giúp',
      icon: <HintIcon />,
      onClick: onHint,
      disabled: disabled.hint,
      shortcut: 'H',
      tooltip: 'Hiển thị gợi ý hoặc trợ giúp (Phím H)',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
        flexWrap: 'wrap',
        mt: 2,
        mb: 1.5,
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
                minWidth: { xs: 96, sm: 104 },
                px: 1.25,
                py: 0.75,
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                lineHeight: 1.1,
                textTransform: 'none',
                '& .MuiButton-startIcon': {
                  mr: 0.75,
                  '& > *:nth-of-type(1)': {
                    fontSize: 18,
                  },
                },
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
