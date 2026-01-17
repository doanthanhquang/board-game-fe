/**
 * Utility for handling board cell clicks based on game type
 */

import type { GameType } from '@/types/game-types';

interface CellClickHandlers {
  caro?: {
    handleCellClick: (row: number, col: number) => void;
  };
  ticTacToe?: {
    handleCellClick: (row: number, col: number) => void;
  };
  match3?: {
    handleTileClick: (row: number, col: number) => void;
  };
  memory?: {
    handleCardClick: (row: number, col: number) => void;
  };
  freeDraw?: {
    handleCellClick: (row: number, col: number) => void;
  };
}

export const createCellClickHandler = (
  gameType: GameType,
  handlers: CellClickHandlers,
  setSelectedCell: (cell: { row: number; col: number } | undefined) => void
) => {
  return (row: number, col: number) => {
    switch (gameType) {
      case 'caro':
        if (handlers.caro) {
          handlers.caro.handleCellClick(row, col);
          setSelectedCell(undefined);
        }
        break;
      case 'tic-tac-toe':
        if (handlers.ticTacToe) {
          handlers.ticTacToe.handleCellClick(row, col);
          setSelectedCell(undefined);
        }
        break;
      case 'snake':
        // Snake is keyboard-only
        break;
      case 'match-3':
        if (handlers.match3) {
          handlers.match3.handleTileClick(row, col);
        }
        break;
      case 'memory':
        if (handlers.memory) {
          handlers.memory.handleCardClick(row, col);
        }
        break;
      case 'free-draw':
        if (handlers.freeDraw) {
          handlers.freeDraw.handleCellClick(row, col);
        }
        break;
      default:
        setSelectedCell({ row, col });
    }
  };
};
