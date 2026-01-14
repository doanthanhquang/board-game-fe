/**
 * Caro game logic
 * Manages game state and game flow for caro games
 */

import type { CaroGameState, Player, GameStatus, Move } from '@/types/game-state';
import { checkWin, isBoardFull } from './caro-win-checker';

/**
 * Initialize a new caro game
 * @param width - Board width
 * @param height - Board height
 * @returns Initial game state
 */
export function initializeGame(width: number, height: number): CaroGameState {
  const board: (Player | null)[][] = [];
  for (let row = 0; row < height; row++) {
    board[row] = [];
    for (let col = 0; col < width; col++) {
      board[row][col] = null;
    }
  }

  return {
    board,
    currentPlayer: 'player',
    gameStatus: 'playing',
    winner: null,
    moves: 0,
    lastMove: null,
  };
}

/**
 * Check if a move is valid (cell is empty)
 * @param board - 2D array representing the game board
 * @param row - Row index
 * @param col - Column index
 * @returns True if move is valid
 */
export function isValidMove(board: (Player | null)[][], row: number, col: number): boolean {
  if (row < 0 || row >= board.length) return false;
  if (col < 0 || col >= (board[0]?.length || 0)) return false;
  return board[row][col] === null;
}

/**
 * Make a move on the board
 * @param gameState - Current game state
 * @param row - Row index
 * @param col - Column index
 * @param targetInRow - Number of pieces in a row needed to win (default: 4)
 * @returns Updated game state or null if move is invalid
 */
export function makeMove(
  gameState: CaroGameState,
  row: number,
  col: number,
  targetInRow: number = 4
): CaroGameState | null {
  // Check if game is still playing
  if (gameState.gameStatus !== 'playing') {
    return null;
  }

  // Check if move is valid
  if (!isValidMove(gameState.board, row, col)) {
    return null;
  }

  // Create new board state
  const newBoard = gameState.board.map((r) => [...r]);
  newBoard[row][col] = gameState.currentPlayer;

  // Create move
  const move: Move = {
    row,
    col,
    player: gameState.currentPlayer,
  };

  // Check win condition
  const hasWon = checkWin(newBoard, row, col, gameState.currentPlayer, targetInRow);

  let newGameStatus: GameStatus = 'playing';
  let winner: Player | null = null;

  if (hasWon) {
    newGameStatus = gameState.currentPlayer === 'player' ? 'player-won' : 'computer-won';
    winner = gameState.currentPlayer;
  } else if (isBoardFull(newBoard)) {
    newGameStatus = 'draw';
  }

  // Switch turn if game is still playing
  const newCurrentPlayer: Player =
    newGameStatus === 'playing'
      ? gameState.currentPlayer === 'player'
        ? 'computer'
        : 'player'
      : gameState.currentPlayer;

  return {
    board: newBoard,
    currentPlayer: newCurrentPlayer,
    gameStatus: newGameStatus,
    winner,
    moves: gameState.moves + 1,
    lastMove: move,
  };
}

/**
 * Reset the game to initial state
 * @param width - Board width
 * @param height - Board height
 * @returns New game state
 */
export function resetGame(width: number, height: number): CaroGameState {
  return initializeGame(width, height);
}
