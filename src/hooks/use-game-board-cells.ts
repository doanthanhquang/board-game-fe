/**
 * Hook to generate board cells based on game type
 */

import { useMemo } from 'react';
import type { BoardCell } from '@/types/board';
import type { Game } from '@/api/games';
import type { GameType } from '@/types/game-types';

interface UseGameBoardCellsProps {
  game: Game | null;
  gameType: GameType;
  selectedCell: { row: number; col: number } | undefined;
  caroBoardCells: BoardCell[][];
  ticTacToeBoardCells: BoardCell[][];
  snakeBoardCells: BoardCell[][];
  match3BoardCells: BoardCell[][];
  memoryBoardCells: BoardCell[][];
  freeDrawBoardCells: BoardCell[][];
}

export const useGameBoardCells = ({
  game,
  gameType,
  selectedCell,
  caroBoardCells,
  ticTacToeBoardCells,
  snakeBoardCells,
  match3BoardCells,
  memoryBoardCells,
  freeDrawBoardCells,
}: UseGameBoardCellsProps): BoardCell[][] => {
  return useMemo<BoardCell[][]>(() => {
    if (!game) return [];

    // Return game-specific board cells
    if (gameType === 'snake' && snakeBoardCells.length > 0) {
      return snakeBoardCells;
    }

    if (gameType === 'match-3' && match3BoardCells.length > 0) {
      return match3BoardCells;
    }

    if (gameType === 'memory' && memoryBoardCells.length > 0) {
      return memoryBoardCells;
    }

    if (gameType === 'free-draw' && freeDrawBoardCells.length > 0) {
      return freeDrawBoardCells;
    }

    // Tic-Tac-Toe with selection highlighting
    if (gameType === 'tic-tac-toe' && ticTacToeBoardCells.length > 0) {
      return ticTacToeBoardCells.map((row, rowIndex) =>
        row.map((cell, colIndex) => ({
          ...cell,
          selected:
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? true : cell.selected,
        }))
      );
    }

    // Caro with selection highlighting
    if (gameType === 'caro') {
      return caroBoardCells.map((row, rowIndex) =>
        row.map((cell, colIndex) => ({
          ...cell,
          selected:
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? true : cell.selected,
        }))
      );
    }

    // Default: create empty cells
    const cells: BoardCell[][] = [];
    for (let row = 0; row < game.default_board_height; row++) {
      cells[row] = [];
      for (let col = 0; col < game.default_board_width; col++) {
        cells[row][col] = {
          row,
          col,
          color: null,
          selected: selectedCell?.row === row && selectedCell?.col === col,
          disabled: false,
        };
      }
    }
    return cells;
  }, [
    game,
    gameType,
    selectedCell,
    caroBoardCells,
    ticTacToeBoardCells,
    snakeBoardCells,
    match3BoardCells,
    memoryBoardCells,
    freeDrawBoardCells,
  ]);
};
