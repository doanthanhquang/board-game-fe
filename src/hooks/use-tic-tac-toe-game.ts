import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BoardCell } from '@/types/board';
import {
  initializeTicTacToeGame,
  makeTicTacToeMove,
  resetTicTacToeGame,
  type TicTacToeGameState,
} from '@/games/tic-tac-toe/tic-tac-toe-game';

interface UseTicTacToeGameProps {
  enabled: boolean;
  playerIcon: 'X' | 'O';
}

interface UseTicTacToeGameReturn {
  gameState: TicTacToeGameState | null;
  boardCells: BoardCell[][];
  handleCellClick: (row: number, col: number) => void;
  handleReset: () => void;
  getStatusMessage: () => string | null;
  isGameEnded: boolean;
}

export function useTicTacToeGame({
  enabled,
  playerIcon,
}: UseTicTacToeGameProps): UseTicTacToeGameReturn {
  const [gameState, setGameState] = useState<TicTacToeGameState | null>(null);
  const computerIcon = playerIcon === 'X' ? 'O' : 'X';

  useEffect(() => {
    // Initialize or clear game state asynchronously when enabled flag changes
    if (enabled) {
      const initial = initializeTicTacToeGame();
      const timer = setTimeout(() => {
        setGameState(initial);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setGameState(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [enabled]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!enabled || !gameState || gameState.status !== 'playing') return;
      // Only allow moves when it's the human player's turn
      if (gameState.currentPlayer !== playerIcon) return;

      const next = makeTicTacToeMove(gameState, row, col);
      if (next) {
        setGameState(next);
      }
    },
    [enabled, gameState, playerIcon]
  );

  const handleReset = useCallback(() => {
    if (!enabled) return;
    const reset = resetTicTacToeGame();
    setGameState(reset);
  }, [enabled]);

  // Simple AI: when it's computer's turn, automatically pick a random empty cell
  useEffect(() => {
    if (!enabled || !gameState || gameState.status !== 'playing') return;
    if (gameState.currentPlayer !== computerIcon) return;

    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < gameState.board.length; row++) {
      for (let col = 0; col < gameState.board[row].length; col++) {
        if (gameState.board[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return;

    const timer = setTimeout(() => {
      const choice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const next = makeTicTacToeMove(gameState, choice.row, choice.col);
      if (next) {
        setGameState(next);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [enabled, gameState, computerIcon]);

  const getStatusMessage = useCallback((): string | null => {
    if (!enabled || !gameState) return null;

    switch (gameState.status) {
      case 'x-won':
      case 'o-won': {
        const winnerIcon = gameState.status === 'x-won' ? 'X' : 'O';
        const humanWon = winnerIcon === playerIcon;
        return humanWon ? '🎉 Bạn đã thắng!' : '😔 Máy đã thắng!';
      }
      case 'draw':
        return 'Hòa!';
      case 'playing':
      default:
        return gameState.currentPlayer === playerIcon ? 'Lượt của bạn' : 'Lượt của máy';
    }
  }, [enabled, gameState, playerIcon]);

  const isGameEnded = useMemo(() => {
    return gameState ? gameState.status !== 'playing' : false;
  }, [gameState]);

  const boardCells = useMemo<BoardCell[][]>(() => {
    if (!enabled || !gameState) return [];

    const size = gameState.board.length;
    const cells: BoardCell[][] = [];

    for (let row = 0; row < size; row++) {
      cells[row] = [];
      for (let col = 0; col < size; col++) {
        const value = gameState.board[row][col];
        let color: string | null = null;
        let icon: 'X' | 'O' | null = null;
        let disabled = false;
        let movePlayer: 'player' | 'computer' | undefined;

        if (value === 'X' || value === 'O') {
          icon = value;
          // Map X/O sang người chơi hoặc máy để dùng lại màu sắc giống Caro
          movePlayer = value === playerIcon ? 'player' : 'computer';
          // Để màu nền trong suốt, màu viền + icon lấy theo movePlayer trong BoardCell
          color = null;
          disabled = true;
        }

        // Disable cells when game ended or when it's computer's turn
        if (gameState.status !== 'playing' || gameState.currentPlayer === computerIcon) {
          disabled = true;
        }

        const isLastMove = gameState.lastMove?.row === row && gameState.lastMove?.col === col;

        cells[row][col] = {
          row,
          col,
          color,
          selected: false,
          disabled,
          isLastMove,
          icon,
          movePlayer,
        };
      }
    }

    return cells;
  }, [enabled, gameState, playerIcon, computerIcon]);

  return {
    gameState,
    boardCells,
    handleCellClick,
    handleReset,
    getStatusMessage,
    isGameEnded,
  };
}
