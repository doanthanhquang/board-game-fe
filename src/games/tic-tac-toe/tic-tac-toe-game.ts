/**
 * Tic-Tac-Toe game logic
 * Manages game state and game flow for a 3x3 Tic-Tac-Toe game (player vs player).
 */

export type TicTacToePlayer = 'X' | 'O';

export type TicTacToeStatus = 'playing' | 'x-won' | 'o-won' | 'draw';

export interface TicTacToeMove {
  row: number;
  col: number;
  player: TicTacToePlayer;
}

export interface TicTacToeGameState {
  board: (TicTacToePlayer | null)[][];
  currentPlayer: TicTacToePlayer;
  status: TicTacToeStatus;
  moves: number;
  lastMove: TicTacToeMove | null;
}

/**
 * Initialize a new Tic-Tac-Toe game with a 3x3 empty board.
 */
export function initializeTicTacToeGame(): TicTacToeGameState {
  const size = 3;
  const board: (TicTacToePlayer | null)[][] = [];

  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      board[row][col] = null;
    }
  }

  return {
    board,
    currentPlayer: 'X',
    status: 'playing',
    moves: 0,
    lastMove: null,
  };
}

function isValidMove(board: (TicTacToePlayer | null)[][], row: number, col: number): boolean {
  if (row < 0 || row >= board.length) return false;
  if (col < 0 || col >= (board[0]?.length || 0)) return false;
  return board[row][col] === null;
}

/**
 * Check if the given player has 3 in a row including the last move.
 */
function checkTicTacToeWin(
  board: (TicTacToePlayer | null)[][],
  row: number,
  col: number,
  player: TicTacToePlayer
): boolean {
  const size = board.length;

  // Row
  let count = 0;
  for (let c = 0; c < size; c++) {
    if (board[row][c] === player) count++;
  }
  if (count === size) return true;

  // Column
  count = 0;
  for (let r = 0; r < size; r++) {
    if (board[r]?.[col] === player) count++;
  }
  if (count === size) return true;

  // Main diagonal
  if (row === col) {
    count = 0;
    for (let i = 0; i < size; i++) {
      if (board[i]?.[i] === player) count++;
    }
    if (count === size) return true;
  }

  // Anti-diagonal
  if (row + col === size - 1) {
    count = 0;
    for (let i = 0; i < size; i++) {
      if (board[i]?.[size - 1 - i] === player) count++;
    }
    if (count === size) return true;
  }

  return false;
}

function isBoardFull(board: (TicTacToePlayer | null)[][]): boolean {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Make a move on the Tic-Tac-Toe board.
 * Returns the updated game state or null if the move is invalid.
 */
export function makeTicTacToeMove(
  gameState: TicTacToeGameState,
  row: number,
  col: number
): TicTacToeGameState | null {
  if (gameState.status !== 'playing') {
    return null;
  }

  if (!isValidMove(gameState.board, row, col)) {
    return null;
  }

  const newBoard = gameState.board.map((r) => [...r]);
  newBoard[row][col] = gameState.currentPlayer;

  const move: TicTacToeMove = {
    row,
    col,
    player: gameState.currentPlayer,
  };

  const hasWon = checkTicTacToeWin(newBoard, row, col, gameState.currentPlayer);

  let status: TicTacToeStatus = 'playing';
  if (hasWon) {
    status = gameState.currentPlayer === 'X' ? 'x-won' : 'o-won';
  } else if (isBoardFull(newBoard)) {
    status = 'draw';
  }

  const nextPlayer: TicTacToePlayer =
    status === 'playing' ? (gameState.currentPlayer === 'X' ? 'O' : 'X') : gameState.currentPlayer;

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    status,
    moves: gameState.moves + 1,
    lastMove: move,
  };
}

export function resetTicTacToeGame(): TicTacToeGameState {
  return initializeTicTacToeGame();
}
