import { Box } from '@mui/material';
import { BoardCell } from './board-cell';
import type { GameBoardProps } from '@/types/board';

/**
 * GameBoard component - renders a grid of circular button cells
 */
export const GameBoard = ({
  width,
  height,
  cells,
  selectedCell,
  onCellClick,
  disabled = false,
}: GameBoardProps) => {
  // Calculate cell size based on container and board dimensions
  const maxCellSize = 50;
  const minCellSize = 30;
  const cellSize = Math.max(
    minCellSize,
    Math.min(maxCellSize, Math.floor(600 / Math.max(width, height)))
  );

  const gap = 4; // Gap between cells

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        width: '100%',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          gap: `${gap}px`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize + gap}px ${cellSize + gap}px`,
            backgroundPosition: 'center',
            pointerEvents: 'none',
            opacity: 0.3,
          },
        }}
      >
        {cells.map((row) =>
          row.map((cell) => {
            const isSelected = selectedCell?.row === cell.row && selectedCell?.col === cell.col;
            return (
              <BoardCell
                key={`cell-${cell.row}-${cell.col}`}
                cell={{
                  ...cell,
                  selected: isSelected,
                  disabled: disabled || cell.disabled,
                }}
                onClick={onCellClick}
                size={cellSize}
              />
            );
          })
        )}
      </Box>
    </Box>
  );
};
