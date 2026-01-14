/**
 * Win condition checker for caro games
 * Checks for 4 in a row (horizontal, vertical, diagonal)
 */

import type { Player } from '@/types/game-state';

/**
 * Check if a player has won with 4 in a row
 * @param board - 2D array representing the game board
 * @param row - Row index of last move
 * @param col - Column index of last move
 * @param player - Player to check win for
 * @param winCount - Number of pieces needed to win (default: 4)
 * @returns True if player has won
 */
export function checkWin(
  board: (Player | null)[][],
  row: number,
  col: number,
  player: Player,
  winCount: number = 4
): boolean {
  const height = board.length;
  const width = board[0]?.length || 0;

  // Check horizontal
  let count = 1; // Count the current piece
  // Check left
  for (let c = col - 1; c >= 0 && board[row][c] === player; c--) {
    count++;
  }
  // Check right
  for (let c = col + 1; c < width && board[row][c] === player; c++) {
    count++;
  }
  if (count >= winCount) return true;

  // Check vertical
  count = 1;
  // Check up
  for (let r = row - 1; r >= 0 && board[r]?.[col] === player; r--) {
    count++;
  }
  // Check down
  for (let r = row + 1; r < height && board[r]?.[col] === player; r++) {
    count++;
  }
  if (count >= winCount) return true;

  // Check diagonal (top-left to bottom-right)
  count = 1;
  // Check top-left
  for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && board[r]?.[c] === player; r--, c--) {
    count++;
  }
  // Check bottom-right
  for (
    let r = row + 1, c = col + 1;
    r < height && c < width && board[r]?.[c] === player;
    r++, c++
  ) {
    count++;
  }
  if (count >= winCount) return true;

  // Check diagonal (top-right to bottom-left)
  count = 1;
  // Check top-right
  for (let r = row - 1, c = col + 1; r >= 0 && c < width && board[r]?.[c] === player; r--, c++) {
    count++;
  }
  // Check bottom-left
  for (let r = row + 1, c = col - 1; r < height && c >= 0 && board[r]?.[c] === player; r++, c--) {
    count++;
  }
  if (count >= winCount) return true;

  return false;
}

/**
 * Check if the board is full (draw condition)
 * @param board - 2D array representing the game board
 * @returns True if board is full
 */
export function isBoardFull(board: (Player | null)[][]): boolean {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}
