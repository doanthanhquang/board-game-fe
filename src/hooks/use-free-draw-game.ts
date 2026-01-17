/**
 * Custom hook for Free-Draw game logic
 * Manages drawing state, color selection, and cell coloring
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { FreeDrawGameState } from '@/types/game-state';
import type { BoardCell } from '@/types/board';
import {
  initializeFreeDrawGame,
  setCellColor,
  clearBoard,
  setSelectedColor,
  getSerializableState as getSerializableGameState,
  restoreState as restoreGameState,
} from '@/games/free-draw/free-draw-game';

interface UseFreeDrawGameProps {
  width: number;
  height: number;
  enabled: boolean;
}

interface UseFreeDrawGameReturn {
  gameState: FreeDrawGameState | null;
  boardCells: BoardCell[][];
  handleCellClick: (row: number, col: number) => void;
  handleColorChange: (color: string) => void;
  handleClearBoard: () => void;
  getSerializableState: () => FreeDrawGameState | null;
  restoreState: (state: Partial<FreeDrawGameState>) => void;
}

/**
 * Custom hook for managing free-draw game state and logic
 */
export function useFreeDrawGame({
  width,
  height,
  enabled,
}: UseFreeDrawGameProps): UseFreeDrawGameReturn {
  // Initialize game state
  const [gameState, setGameState] = useState<FreeDrawGameState | null>(() => {
    if (enabled && width > 0 && height > 0) {
      return initializeFreeDrawGame(width, height);
    }
    return null;
  });

  // Track previous dimensions to detect changes
  const prevDimsRef = useRef({ enabled, width, height });

  // Update game state when dimensions or enabled state changes
  useEffect(() => {
    const prev = prevDimsRef.current;
    if (prev.enabled !== enabled || prev.width !== width || prev.height !== height) {
      prevDimsRef.current = { enabled, width, height };
      if (enabled && width > 0 && height > 0) {
        const initialState = initializeFreeDrawGame(width, height);
        // Use setTimeout to defer state update and avoid synchronous setState in effect
        setTimeout(() => {
          setGameState(initialState);
        }, 0);
      } else {
        setTimeout(() => {
          setGameState(null);
        }, 0);
      }
    }
  }, [enabled, width, height]);

  // Convert game state to board cells for rendering
  const boardCells: BoardCell[][] = useMemo(() => {
    if (!gameState) {
      return [];
    }

    return gameState.board.map((row, rowIdx) =>
      row.map((color, colIdx) => {
        const cell: BoardCell = {
          row: rowIdx,
          col: colIdx,
          color: color || null,
        };
        return cell;
      })
    );
  }, [gameState]);

  // Handle cell click - apply selected color
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!gameState || !enabled) {
        return;
      }

      const newState = setCellColor(gameState, row, col, gameState.selectedColor);
      setGameState(newState);
    },
    [gameState, enabled]
  );

  // Handle color change
  const handleColorChange = useCallback(
    (color: string) => {
      if (!gameState) {
        return;
      }

      const newState = setSelectedColor(gameState, color);
      setGameState(newState);
    },
    [gameState]
  );

  // Handle clear board
  const handleClearBoard = useCallback(() => {
    if (!gameState) {
      return;
    }

    const newState = clearBoard(gameState);
    setGameState(newState);
  }, [gameState]);

  // Get serializable state for save
  const getSerializableState = useCallback((): FreeDrawGameState | null => {
    if (!gameState) {
      return null;
    }
    return getSerializableGameState(gameState);
  }, [gameState]);

  // Restore state from saved data
  const restoreState = useCallback((savedState: Partial<FreeDrawGameState>) => {
    const restored = restoreGameState(savedState);
    setGameState(restored);
  }, []);

  return {
    gameState,
    boardCells,
    handleCellClick,
    handleColorChange,
    handleClearBoard,
    getSerializableState,
    restoreState,
  };
}
