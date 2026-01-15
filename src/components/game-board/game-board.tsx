import { Box, useMediaQuery, useTheme } from '@mui/material';
import { BoardCell } from '@/components/game-board/board-cell';
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
  onCellDragStart,
  onCellDragEnd,
  onCellDragOver,
  onCellDrop,
  disabled = false,
  cellSizeMultiplier = 1,
}: GameBoardProps) => {
  const theme = useTheme();
  const isXsDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmDown = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate cell size based on container and board dimensions
  const maxCellSize = 50;
  const minCellSize = 20;

  let maxBoardPixels = 600;
  if (isSmDown) maxBoardPixels = 480;
  if (isXsDown) maxBoardPixels = 320;

  const baseCellSize = Math.max(
    minCellSize,
    Math.min(maxCellSize, Math.floor(maxBoardPixels / Math.max(width, height)))
  );

  // Apply multiplier to make cells smaller for certain games (e.g., Snake)
  const cellSize = Math.max(minCellSize, Math.floor(baseCellSize * cellSizeMultiplier));

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

            const computedDisabled = disabled || cell.disabled;

            // ✅ Nếu selected/disabled không đổi thì giữ nguyên reference
            if (cell.selected === isSelected && cell.disabled === computedDisabled) {
              return (
                <BoardCell
                  key={`cell-${cell.row}-${cell.col}`}
                  cell={cell}
                  onClick={onCellClick}
                  onDragStart={onCellDragStart}
                  onDragEnd={onCellDragEnd}
                  onDragOver={onCellDragOver}
                  onDrop={onCellDrop}
                  size={cellSize}
                />
              );
            }

            // ✅ Chỉ clone khi cần thay đổi selected/disabled
            return (
              <BoardCell
                key={`cell-${cell.row}-${cell.col}`}
                cell={{ ...cell, selected: isSelected, disabled: computedDisabled }}
                onClick={onCellClick}
                onDragStart={onCellDragStart}
                onDragEnd={onCellDragEnd}
                onDragOver={onCellDragOver}
                size={cellSize}
              />
            );
          })
        )}
      </Box>
    </Box>
  );
};
