/**
 * AI opponent for caro games
 * Implements strategic AI with blocking and attacking capabilities
 */

import type { Player } from '@/types/game-state';

export interface AIMove {
  row: number;
  col: number;
}

/**
 * Get all valid moves (empty cells) on the board
 * @param board - 2D array representing the game board
 * @returns Array of valid move positions
 */
export function getValidMoves(board: (Player | null)[][]): AIMove[] {
  const moves: AIMove[] = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
}

/**
 * Count consecutive pieces in a line (for evaluating threats/opportunities)
 * This counts pieces on both sides of the position, excluding the position itself
 * @param board - 2D array representing the game board
 * @param row - Row index
 * @param col - Column index
 * @param player - Player to check
 * @param deltaRow - Row direction (-1, 0, or 1)
 * @param deltaCol - Column direction (-1, 0, or 1)
 * @returns Count of consecutive pieces (excluding the position itself)
 */
function countInDirection(
  board: (Player | null)[][],
  row: number,
  col: number,
  player: Player,
  deltaRow: number,
  deltaCol: number
): number {
  let count = 0;
  const height = board.length;
  const width = board[0]?.length || 0;

  // Check in positive direction
  for (
    let r = row + deltaRow, c = col + deltaCol;
    r >= 0 && r < height && c >= 0 && c < width;
    r += deltaRow, c += deltaCol
  ) {
    if (board[r]?.[c] === player) {
      count++;
    } else {
      break;
    }
  }

  // Check in negative direction
  for (
    let r = row - deltaRow, c = col - deltaCol;
    r >= 0 && r < height && c >= 0 && c < width;
    r -= deltaRow, c -= deltaCol
  ) {
    if (board[r]?.[c] === player) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

/**
 * Check if placing a piece at (row, col) would create N in a row for a player
 * @param board - 2D array representing the game board
 * @param row - Row index
 * @param col - Column index
 * @param player - Player to check
 * @param targetCount - Target count (e.g., 3 for three in a row)
 * @returns True if move would create targetCount in a row
 */
function wouldCreateCount(
  board: (Player | null)[][],
  row: number,
  col: number,
  player: Player,
  targetCount: number
): boolean {
  // Create a copy of the board to test the move
  const testBoard = board.map((r) => [...r]);
  testBoard[row][col] = player;

  // Check all directions
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal \
    [1, -1], // diagonal /
  ];

  for (const [deltaRow, deltaCol] of directions) {
    const count = countInDirection(testBoard, row, col, player, deltaRow, deltaCol) + 1;
    if (count >= targetCount) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluate move priority
 * Higher number = better move
 * @param board - 2D array representing the game board
 * @param move - Move to evaluate
 * @returns Priority score
 */
function evaluateMove(board: (Player | null)[][], move: AIMove): number {
  const { row, col } = move;

  // Priority 1000: Win immediately (4 in a row)
  if (wouldCreateCount(board, row, col, 'computer', 4)) {
    return 1000;
  }

  // Priority 900: Block player from winning (player has 3 in a row)
  if (wouldCreateCount(board, row, col, 'player', 4)) {
    return 900;
  }

  // Priority 800: Create 3 in a row for computer (threatening win)
  if (wouldCreateCount(board, row, col, 'computer', 3)) {
    return 800;
  }

  // Priority 700: Block player from getting 3 in a row
  if (wouldCreateCount(board, row, col, 'player', 3)) {
    return 700;
  }

  // Priority 600: Create 2 in a row for computer
  if (wouldCreateCount(board, row, col, 'computer', 2)) {
    return 600;
  }

  // Priority 500: Block player from getting 2 in a row
  if (wouldCreateCount(board, row, col, 'player', 2)) {
    return 500;
  }

  // Priority 100: Random move (base priority)
  return 100;
}

/**
 * Make an AI move with strategic thinking
 * Priority:
 * 1. Win (4 in a row)
 * 2. Block player win (player has 3 in a row)
 * 3. Attack (create 3 in a row)
 * 4. Block player threat (player has 2 in a row)
 * 5. Create opportunity (2 in a row)
 * 6. Random move
 * @param board - 2D array representing the game board
 * @returns AI move or null if no valid moves available
 */
export function makeAIMove(board: (Player | null)[][]): AIMove | null {
  const validMoves = getValidMoves(board);
  if (validMoves.length === 0) {
    return null;
  }

  // Evaluate all moves
  const evaluatedMoves = validMoves.map((move) => ({
    move,
    priority: evaluateMove(board, move),
  }));

  // Sort by priority (highest first)
  evaluatedMoves.sort((a, b) => b.priority - a.priority);

  // Get all moves with highest priority
  const highestPriority = evaluatedMoves[0].priority;
  const bestMoves = evaluatedMoves.filter((m) => m.priority === highestPriority).map((m) => m.move);

  // If multiple moves have same priority, select randomly from them
  if (bestMoves.length === 1) {
    return bestMoves[0];
  }

  const randomIndex = Math.floor(Math.random() * bestMoves.length);
  return bestMoves[randomIndex];
}

/**
 * Select a random move from valid moves (fallback)
 * @param validMoves - Array of valid move positions
 * @returns Random move or null if no valid moves
 */
export function selectRandomMove(validMoves: AIMove[]): AIMove | null {
  if (validMoves.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
}
