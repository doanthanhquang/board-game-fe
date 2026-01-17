/**
 * Free-Draw Game Logic
 * Handles drawing game state and operations
 */

import type { FreeDrawGameState } from '@/types/game-state';

/**
 * Initialize a new free-draw game
 * @param width - Board width
 * @param height - Board height
 * @param defaultColor - Default selected color (hex string)
 * @returns Initialized game state
 */
export function initializeFreeDrawGame(
  width: number,
  height: number,
  defaultColor: string = '#000000'
): FreeDrawGameState {
  const board: (string | null)[][] = [];
  for (let row = 0; row < height; row++) {
    board[row] = [];
    for (let col = 0; col < width; col++) {
      board[row][col] = null;
    }
  }

  return {
    board,
    selectedColor: defaultColor,
    boardWidth: width,
    boardHeight: height,
    gameStatus: 'drawing',
  };
}

/**
 * Set color of a specific cell
 * @param state - Current game state
 * @param row - Row index
 * @param col - Column index
 * @param color - Color to set (hex string or null to clear)
 * @returns New game state with updated cell
 */
export function setCellColor(
  state: FreeDrawGameState,
  row: number,
  col: number,
  color: string | null
): FreeDrawGameState {
  if (row < 0 || row >= state.boardHeight || col < 0 || col >= state.boardWidth) {
    return state;
  }

  const newBoard = state.board.map((r, rIdx) =>
    rIdx === row ? r.map((c, cIdx) => (cIdx === col ? color : c)) : r
  );

  return {
    ...state,
    board: newBoard,
  };
}

/**
 * Clear a specific cell (set to null)
 * @param state - Current game state
 * @param row - Row index
 * @param col - Column index
 * @returns New game state with cleared cell
 */
export function clearCell(state: FreeDrawGameState, row: number, col: number): FreeDrawGameState {
  return setCellColor(state, row, col, null);
}

/**
 * Clear entire board (set all cells to null)
 * @param state - Current game state
 * @returns New game state with cleared board
 */
export function clearBoard(state: FreeDrawGameState): FreeDrawGameState {
  const newBoard: (string | null)[][] = [];
  for (let row = 0; row < state.boardHeight; row++) {
    newBoard[row] = [];
    for (let col = 0; col < state.boardWidth; col++) {
      newBoard[row][col] = null;
    }
  }

  return {
    ...state,
    board: newBoard,
  };
}

/**
 * Set selected color
 * @param state - Current game state
 * @param color - Color to select (hex string)
 * @returns New game state with updated selected color
 */
export function setSelectedColor(state: FreeDrawGameState, color: string): FreeDrawGameState {
  return {
    ...state,
    selectedColor: color,
  };
}

/**
 * Get serializable state for save/load
 * @param state - Current game state
 * @returns Serializable state object
 */
export function getSerializableState(state: FreeDrawGameState): FreeDrawGameState {
  return {
    board: state.board.map((row) => [...row]),
    selectedColor: state.selectedColor,
    boardWidth: state.boardWidth,
    boardHeight: state.boardHeight,
    gameStatus: state.gameStatus,
  };
}

/**
 * Restore state from saved data
 * @param savedState - Saved game state
 * @returns Restored game state
 */
export function restoreState(savedState: Partial<FreeDrawGameState>): FreeDrawGameState {
  const defaultState = initializeFreeDrawGame(
    savedState.boardWidth || 30,
    savedState.boardHeight || 30,
    savedState.selectedColor || '#000000'
  );

  return {
    ...defaultState,
    ...savedState,
    board: savedState.board || defaultState.board,
  };
}
