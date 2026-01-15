import { memo } from 'react';
import { IconButton, useTheme, Typography } from '@mui/material';
import type { BoardCell as BoardCellType } from '@/types/board';

interface BoardCellProps {
  cell: BoardCellType;
  onClick?: (row: number, col: number) => void;
  onDragStart?: (row: number, col: number) => void;
  onDragEnd?: (row: number, col: number) => void;
  onDragOver?: (row: number, col: number) => void;
  onDrop?: (row: number, col: number) => void;
  size?: number;
}

/**
 * BoardCell component - renders a single circular button cell
 */
export const BoardCell = memo(
  ({ cell, onClick, onDragStart, onDragEnd, onDragOver, onDrop, size = 40 }: BoardCellProps) => {
    const theme = useTheme();

    const handleClick = () => {
      if (!cell.disabled && onClick) {
        onClick(cell.row, cell.col);
      }
    };

    const handleDragStart = (e: React.DragEvent) => {
      if (!cell.disabled && onDragStart && cell.color) {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(cell.row, cell.col);
      }
    };

    const handleDragEnd = () => {
      if (onDragEnd) {
        onDragEnd(cell.row, cell.col);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!cell.disabled && onDragOver) {
        e.dataTransfer.dropEffect = 'move';
        onDragOver(cell.row, cell.col);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (!cell.disabled && onDrop) {
        onDrop(cell.row, cell.col);
      }
    };

    // Determine if cell has a piece or icon (permanent content)
    const hasIcon = !!cell.icon;
    const hasPiece = cell.color !== null || hasIcon;

    // For caro (with icon), keep background transparent so X/O nổi bật hơn
    const backgroundColor = hasIcon ? 'transparent' : cell.color || 'transparent';

    // Determine border color based on move player
    const getBorderColor = () => {
      if (cell.isFood) {
        // Food gets bright warning color border for maximum visibility
        return theme.palette.warning.dark;
      }
      if (cell.isKeyboardPosition && hasPiece) {
        // Keyboard position gets bright primary color border
        return theme.palette.primary.main;
      }
      if (cell.isLastMove) {
        // Last move gets extra highlight - thicker border with distinct color
        if (cell.movePlayer === 'player') {
          return theme.palette.success.main; // Green for player's last move
        } else if (cell.movePlayer === 'computer') {
          return theme.palette.warning.main; // Orange/amber for computer's last move
        }
      } else if (hasPiece && cell.movePlayer) {
        // All moves get colored border based on player
        if (cell.movePlayer === 'player') {
          return theme.palette.primary.dark; // Darker blue for player moves
        } else if (cell.movePlayer === 'computer') {
          return theme.palette.error.dark; // Darker red for computer moves
        }
      } else if (cell.selected && !hasPiece) {
        return theme.palette.primary.main;
      } else if (hasPiece) {
        return 'rgba(0, 0, 0, 0.1)';
      }
      return theme.palette.divider;
    };

    // Animation styles for Match 3
    // Priority: swapping > falling > matched > dragging > keyboard position > selected
    const getAnimationStyle = () => {
      // Highest priority: swapping animation
      if (cell.isSwapping) {
        return {
          transform: 'scale(0.9)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 10,
        };
      }
      // Second priority: falling animation
      if (cell.isFalling && cell.fallFromRow !== undefined) {
        const fallDistance = (cell.fallFromRow - cell.row) * (size + 4); // 4px gap
        return {
          transform: `translateY(-${fallDistance}px)`,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 5,
        };
      }
      // Third priority: matched (removal) animation
      if (cell.isMatched) {
        return {
          transform: 'scale(0) rotate(180deg)',
          opacity: 0,
          transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
          zIndex: 1,
        };
      }
      // Fourth priority: dragging animation
      if (cell.isDragging) {
        return {
          opacity: 0.6,
          transform: 'scale(1.15)',
          zIndex: 1000,
          transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
          cursor: 'grabbing',
        };
      }
      // Fifth priority: keyboard position (always highlight when navigating)
      if (cell.isKeyboardPosition && hasPiece) {
        return {
          transform: 'scale(1.25)',
          transition: 'transform 0.15s ease-in-out',
          zIndex: 3,
        };
      }
      // Sixth priority: selected tile (for swap)
      if (cell.selected && hasPiece) {
        return {
          transform: 'scale(1.15)',
          transition: 'transform 0.2s ease-in-out',
          zIndex: 2,
        };
      }
      return {};
    };

    const cellStyle = {
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      borderRadius: '50%',
      // Background color (transparent when showing X/O icon)
      backgroundColor,
      border: cell.isFood
        ? '4px solid' // Thick border for food
        : cell.isKeyboardPosition && hasPiece
          ? '3px solid' // Thick border for keyboard position
          : cell.isLastMove
            ? '4px solid' // Thicker border for last move
            : cell.selected && !hasPiece
              ? '3px solid'
              : hasPiece
                ? '2px solid' // Colored border for all moves
                : '1px solid',
      borderColor: getBorderColor(),
      // Keep full opacity for cells with pieces - never reduce it
      opacity:
        cell.isMatched || cell.isDragging
          ? cell.isMatched
            ? 0
            : 0.5
          : hasPiece
            ? 1
            : cell.disabled && !cell.isLastMove
              ? 0.5
              : 1,
      cursor: cell.disabled ? 'not-allowed' : cell.color ? 'grab' : 'pointer',
      cursorActive: cell.color && !cell.disabled ? 'grabbing' : undefined,
      // Only transition non-color properties for cells with pieces to preserve color
      transition: hasPiece
        ? 'border 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out, opacity 0.2s ease-in-out'
        : 'all 0.2s ease-in-out',
      // Pulsing animation for food
      ...(cell.isFood && {
        animation: 'foodPulse 1.5s ease-in-out infinite',
      }),
      '&:hover': {
        // Never change background color on hover for cells with pieces
        backgroundColor: hasPiece ? backgroundColor : undefined,
        transform: cell.disabled ? 'none' : cell.selected ? 'scale(1.2)' : 'scale(1.1)',
        boxShadow: cell.disabled ? 'none' : cell.selected ? 4 : 2,
      },
      boxShadow: cell.isFood
        ? `0 0 12px ${theme.palette.warning.main}80` // Glow effect for food
        : cell.isLastMove
          ? 4
          : cell.selected && !hasPiece
            ? 3
            : cell.selected && hasPiece
              ? 4 // Stronger shadow for selected tile with piece
              : 0,
      ...getAnimationStyle(),
    };

    return (
      <span style={{ display: 'inline-block' }}>
        <IconButton
          onClick={handleClick}
          disabled={cell.disabled}
          draggable={!cell.disabled && !!cell.color}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={cellStyle}
          aria-label={`Cell at row ${cell.row + 1}, column ${cell.col + 1}`}
        >
          {cell.icon && (
            <Typography
              variant="h5"
              component="span"
              sx={{
                fontWeight: 'bold',
                color:
                  cell.movePlayer === 'player'
                    ? theme.palette.primary.main
                    : theme.palette.error.main,
                userSelect: 'none',
              }}
            >
              {cell.icon}
            </Typography>
          )}
        </IconButton>
      </span>
    );
  }
);

BoardCell.displayName = 'BoardCell';
