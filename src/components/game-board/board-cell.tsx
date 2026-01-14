import { memo } from 'react';
import { IconButton, Tooltip } from '@mui/material';
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
  const handleClick = () => {
    if (!cell.disabled && onClick) {
      onClick(cell.row, cell.col);
    }
  };

  const cellStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
    backgroundColor: cell.color || 'transparent',
    border: cell.selected
      ? '3px solid'
      : cell.color
        ? '2px solid'
        : '1px solid',
    borderColor: cell.selected
      ? 'primary.main'
      : cell.color
        ? 'rgba(0, 0, 0, 0.1)'
        : 'divider',
    opacity: cell.disabled ? 0.5 : 1,
    cursor: cell.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: cell.disabled ? 'none' : 'scale(1.1)',
      boxShadow: cell.disabled ? 'none' : 2,
    },
    boxShadow: cell.selected ? 3 : 0,
  };

  return (
    <Tooltip title={cell.disabled ? 'Disabled' : `Row ${cell.row + 1}, Col ${cell.col + 1}`}>
      <IconButton
        onClick={handleClick}
        disabled={cell.disabled}
        sx={cellStyle}
        aria-label={`Cell at row ${cell.row + 1}, column ${cell.col + 1}`}
      />
    </Tooltip>
  );
});

BoardCell.displayName = 'BoardCell';
