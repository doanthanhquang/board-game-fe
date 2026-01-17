/**
 * Hook for game button handlers (arrow keys, enter, etc.)
 */

import { useCallback } from 'react';
import type { Game } from '@/api/games';
import type { GameType } from '@/types/game-types';

interface GameHandlers {
  caro: {
    handleCellClick: (row: number, col: number) => void;
    isGameEnded: boolean;
    isAITurn: boolean;
  };
  ticTacToe: {
    handleCellClick: (row: number, col: number) => void;
    isGameEnded: boolean;
  };
  snake: {
    changeDirection: (direction: 'left' | 'right' | 'up' | 'down') => void;
  };
  match3: {
    handleMoveSelection: (direction: 'left' | 'right' | 'up' | 'down') => void;
    handleSwapSelected: () => void;
  };
  memory: {
    handleMoveSelection: (direction: 'left' | 'right' | 'up' | 'down') => void;
    handleCardSelect: () => void;
  };
  freeDraw: {
    handleCellClick: (row: number, col: number) => void;
  };
}

interface UseGameButtonHandlersProps {
  game: Game | null;
  gameType: GameType;
  selectedCell: { row: number; col: number } | undefined;
  setSelectedCell: (cell: { row: number; col: number } | undefined) => void;
  showInstructions: boolean;
  showResultDialog: boolean;
  handlers: Partial<GameHandlers>;
}

export const useGameButtonHandlers = ({
  game,
  gameType,
  selectedCell,
  setSelectedCell,
  showInstructions,
  showResultDialog,
  handlers,
}: UseGameButtonHandlersProps) => {
  const handleLeft = useCallback(() => {
    if (showInstructions || showResultDialog) return;

    if (gameType === 'snake' && handlers.snake) {
      handlers.snake.changeDirection('left');
      return;
    }

    if ((gameType === 'match-3' || gameType === 'memory') && handlers.match3) {
      handlers.match3.handleMoveSelection('left');
      return;
    }

    if (gameType === 'memory' && handlers.memory) {
      handlers.memory.handleMoveSelection('left');
      return;
    }

    // Navigate selection left
    if (selectedCell && game) {
      const newCol = Math.max(0, selectedCell.col - 1);
      setSelectedCell({ ...selectedCell, col: newCol });
    } else if (game) {
      setSelectedCell({ row: 0, col: 0 });
    }
  }, [gameType, selectedCell, game, showInstructions, showResultDialog, handlers, setSelectedCell]);

  const handleRight = useCallback(() => {
    if (showInstructions || showResultDialog) return;

    if (gameType === 'snake' && handlers.snake) {
      handlers.snake.changeDirection('right');
      return;
    }

    if ((gameType === 'match-3' || gameType === 'memory') && handlers.match3) {
      handlers.match3.handleMoveSelection('right');
      return;
    }

    if (gameType === 'memory' && handlers.memory) {
      handlers.memory.handleMoveSelection('right');
      return;
    }

    // Navigate selection right
    if (selectedCell && game) {
      const newCol = Math.min(game.default_board_width - 1, selectedCell.col + 1);
      setSelectedCell({ ...selectedCell, col: newCol });
    } else if (game) {
      setSelectedCell({ row: 0, col: 0 });
    }
  }, [gameType, selectedCell, game, showInstructions, showResultDialog, handlers, setSelectedCell]);

  const handleUp = useCallback(() => {
    if (showInstructions || showResultDialog) return;

    if (gameType === 'snake' && handlers.snake) {
      handlers.snake.changeDirection('up');
      return;
    }

    if ((gameType === 'match-3' || gameType === 'memory') && handlers.match3) {
      handlers.match3.handleMoveSelection('up');
      return;
    }

    if (gameType === 'memory' && handlers.memory) {
      handlers.memory.handleMoveSelection('up');
      return;
    }

    // Navigate selection up
    if (selectedCell && game) {
      const newRow = Math.max(0, selectedCell.row - 1);
      setSelectedCell({ ...selectedCell, row: newRow });
    } else if (game) {
      setSelectedCell({ row: 0, col: 0 });
    }
  }, [gameType, selectedCell, game, showInstructions, showResultDialog, handlers, setSelectedCell]);

  const handleDown = useCallback(() => {
    if (showInstructions || showResultDialog) return;

    if (gameType === 'snake' && handlers.snake) {
      handlers.snake.changeDirection('down');
      return;
    }

    if ((gameType === 'match-3' || gameType === 'memory') && handlers.match3) {
      handlers.match3.handleMoveSelection('down');
      return;
    }

    if (gameType === 'memory' && handlers.memory) {
      handlers.memory.handleMoveSelection('down');
      return;
    }

    // Navigate selection down
    if (selectedCell && game) {
      const newRow = Math.min(game.default_board_height - 1, selectedCell.row + 1);
      setSelectedCell({ ...selectedCell, row: newRow });
    } else if (game) {
      setSelectedCell({ row: 0, col: 0 });
    }
  }, [gameType, selectedCell, game, showInstructions, showResultDialog, handlers, setSelectedCell]);

  const handleEnter = useCallback(() => {
    if (showInstructions || showResultDialog) return;

    if (gameType === 'match-3' && handlers.match3) {
      handlers.match3.handleSwapSelected();
      return;
    }

    if (gameType === 'memory' && handlers.memory) {
      handlers.memory.handleCardSelect();
      return;
    }

    if (gameType === 'caro' && selectedCell && handlers.caro) {
      if (!handlers.caro.isGameEnded && !handlers.caro.isAITurn) {
        handlers.caro.handleCellClick(selectedCell.row, selectedCell.col);
        setSelectedCell(undefined);
      }
      return;
    }

    if (gameType === 'tic-tac-toe' && selectedCell && handlers.ticTacToe) {
      if (!handlers.ticTacToe.isGameEnded) {
        handlers.ticTacToe.handleCellClick(selectedCell.row, selectedCell.col);
        setSelectedCell(undefined);
      }
      return;
    }
  }, [gameType, selectedCell, showInstructions, showResultDialog, handlers, setSelectedCell]);

  return {
    handleLeft,
    handleRight,
    handleUp,
    handleDown,
    handleEnter,
  };
};
