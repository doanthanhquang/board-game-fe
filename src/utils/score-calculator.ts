/**
 * Calculate player score for Caro games
 */

import type { CaroGameState } from '@/types/game-state';

export const calculateCaroPlayerScore = (gameState: CaroGameState | null): number => {
  if (!gameState) return 0;

  const board = gameState.board;
  let movesCount = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 'player') {
        movesCount++;
      }
    }
  }
  return movesCount;
};
