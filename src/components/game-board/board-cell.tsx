import { memo } from 'react';
import { IconButton, Tooltip, useTheme, Typography } from '@mui/material';
import type { BoardCell as BoardCellType } from '@/types/board';

interface BoardCellProps {
  cell: BoardCellType;
  onClick?: (row: number, col: number) => void;
  size?: number;
}

/**
 * BoardCell component - renders a single circular button cell
 */
export const BoardCell = memo(({ cell, onClick, size = 40 }: BoardCellProps) => {
  const theme = useTheme();

  const handleClick = () => {
    if (!cell.disabled && onClick) {
      onClick(cell.row, cell.col);
    }
  };

  // Determine if cell has a piece or icon (permanent content)
  const hasIcon = !!cell.icon;
  const hasPiece = cell.color !== null || hasIcon;

  // For caro (with icon), keep background transparent so X/O nổi bật hơn
  const backgroundColor = hasIcon ? 'transparent' : cell.color || 'transparent';

  // Determine border color based on move player
  const getBorderColor = () => {
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

  const cellStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
    // Background color (transparent when showing X/O icon)
    backgroundColor,
    border: cell.isLastMove
      ? '4px solid' // Thicker border for last move
      : cell.selected && !hasPiece
        ? '3px solid'
        : hasPiece
          ? '2px solid' // Colored border for all moves
          : '1px solid',
    borderColor: getBorderColor(),
    // Keep full opacity for cells with pieces - never reduce it
    opacity: hasPiece ? 1 : cell.disabled && !cell.isLastMove ? 0.5 : 1,
    cursor: cell.disabled ? 'not-allowed' : 'pointer',
    // Only transition non-color properties for cells with pieces to preserve color
    transition: hasPiece
      ? 'border 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out'
      : 'all 0.2s ease-in-out',
    '&:hover': {
      // Never change background color on hover for cells with pieces
      backgroundColor: hasPiece ? backgroundColor : undefined,
      transform: cell.disabled ? 'none' : 'scale(1.1)',
      boxShadow: cell.disabled ? 'none' : 2,
    },
    boxShadow: cell.isLastMove ? 4 : cell.selected && !hasPiece ? 3 : 0,
  };

  return (
    <Tooltip title={cell.disabled ? 'Disabled' : `Row ${cell.row + 1}, Col ${cell.col + 1}`}>
      <IconButton
        onClick={handleClick}
        disabled={cell.disabled}
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
    </Tooltip>
  );
});

BoardCell.displayName = 'BoardCell';
