/**
 * Match 3 game logic
 * Manages game state and game flow for a Match 3 game (similar to Candy Crush)
 */

export type TileColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type Match3GameStatus = 'playing' | 'time-up' | 'no-moves' | 'game-over';

export interface Match3GameState {
  board: (TileColor | null)[][];
  score: number;
  moves: number;
  timeRemaining: number; // seconds
  gameStatus: Match3GameStatus;
  boardWidth: number;
  boardHeight: number;
  selectedTile: { row: number; col: number } | null;
}

const TILE_COLORS: TileColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const DEFAULT_TIME_LIMIT = 300; // 5 minutes

/**
 * Generate a random tile color
 */
const getRandomTileColor = (): TileColor => {
  return TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
};

/**
 * Check if two positions are adjacent (horizontally or vertically)
 */
const areAdjacent = (
  pos1: { row: number; col: number },
  pos2: { row: number; col: number }
): boolean => {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

/**
 * Find all matches (horizontal and vertical) on the board
 * Returns a set of positions that are part of matches
 */
const findMatches = (board: (TileColor | null)[][]): Set<string> => {
  const matched = new Set<string>();
  const height = board.length;
  const width = board[0]?.length || 0;

  // Check horizontal matches
  for (let row = 0; row < height; row++) {
    let count = 1;
    let currentColor: TileColor | null = board[row][0];

    for (let col = 1; col < width; col++) {
      const tile = board[row][col];
      if (tile === currentColor && tile !== null) {
        count++;
      } else {
        if (count >= 3 && currentColor !== null) {
          // Mark matched tiles
          for (let i = col - count; i < col; i++) {
            matched.add(`${row},${i}`);
          }
        }
        count = 1;
        currentColor = tile;
      }
    }
    // Check end of row
    if (count >= 3 && currentColor !== null) {
      for (let i = width - count; i < width; i++) {
        matched.add(`${row},${i}`);
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < width; col++) {
    let count = 1;
    let currentColor: TileColor | null = board[0]?.[col] || null;

    for (let row = 1; row < height; row++) {
      const tile = board[row]?.[col] || null;
      if (tile === currentColor && tile !== null) {
        count++;
      } else {
        if (count >= 3 && currentColor !== null) {
          // Mark matched tiles
          for (let i = row - count; i < row; i++) {
            matched.add(`${i},${col}`);
          }
        }
        count = 1;
        currentColor = tile;
      }
    }
    // Check end of column
    if (count >= 3 && currentColor !== null) {
      for (let i = height - count; i < height; i++) {
        matched.add(`${i},${col}`);
      }
    }
  }

  return matched;
};

/**
 * Find all match groups and calculate score for each group
 * Returns matched positions and total score
 */
const findMatchesWithScore = (
  board: (TileColor | null)[][]
): { matched: Set<string>; score: number } => {
  const matched = new Set<string>();
  let totalScore = 0;
  const height = board.length;
  const width = board[0]?.length || 0;

  // Check horizontal matches
  for (let row = 0; row < height; row++) {
    let count = 1;
    let currentColor: TileColor | null = board[row][0];

    for (let col = 1; col < width; col++) {
      const tile = board[row][col];
      if (tile === currentColor && tile !== null) {
        count++;
      } else {
        if (count >= 3 && currentColor !== null) {
          // Calculate score for this match group
          const groupScore = calculateScore(count);
          totalScore += groupScore;
          // Mark matched tiles
          for (let i = col - count; i < col; i++) {
            matched.add(`${row},${i}`);
          }
        }
        count = 1;
        currentColor = tile;
      }
    }
    // Check end of row
    if (count >= 3 && currentColor !== null) {
      const groupScore = calculateScore(count);
      totalScore += groupScore;
      for (let i = width - count; i < width; i++) {
        matched.add(`${row},${i}`);
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < width; col++) {
    let count = 1;
    let currentColor: TileColor | null = board[0]?.[col] || null;

    for (let row = 1; row < height; row++) {
      const tile = board[row]?.[col] || null;
      if (tile === currentColor && tile !== null) {
        count++;
      } else {
        if (count >= 3 && currentColor !== null) {
          // Calculate score for this match group
          const groupScore = calculateScore(count);
          totalScore += groupScore;
          // Mark matched tiles
          for (let i = row - count; i < row; i++) {
            matched.add(`${i},${col}`);
          }
        }
        count = 1;
        currentColor = tile;
      }
    }
    // Check end of column
    if (count >= 3 && currentColor !== null) {
      const groupScore = calculateScore(count);
      totalScore += groupScore;
      for (let i = height - count; i < height; i++) {
        matched.add(`${i},${col}`);
      }
    }
  }

  return { matched, score: totalScore };
};

/**
 * Calculate score based on number of tiles matched
 */
const calculateScore = (matchedCount: number): number => {
  if (matchedCount === 3) return 10;
  if (matchedCount === 4) return 20;
  if (matchedCount === 5) return 30;
  // For 6+ tiles, give bonus
  return 30 + (matchedCount - 5) * 10;
};

/**
 * Apply gravity - tiles fall down to fill empty spaces
 */
const applyGravity = (board: (TileColor | null)[][]): (TileColor | null)[][] => {
  const height = board.length;
  const width = board[0]?.length || 0;
  const newBoard = board.map((row) => [...row]);

  // Process each column
  for (let col = 0; col < width; col++) {
    // Collect non-null tiles from bottom to top
    const tiles: (TileColor | null)[] = [];
    for (let row = height - 1; row >= 0; row--) {
      if (newBoard[row][col] !== null) {
        tiles.push(newBoard[row][col]);
      }
    }

    // Fill column from bottom with collected tiles, then nulls at top
    let tileIndex = 0;
    for (let row = height - 1; row >= 0; row--) {
      if (tileIndex < tiles.length) {
        newBoard[row][col] = tiles[tileIndex];
        tileIndex++;
      } else {
        newBoard[row][col] = null;
      }
    }
  }

  return newBoard;
};

/**
 * Spawn new random tiles at the top of each column
 */
const spawnNewTiles = (board: (TileColor | null)[][]): (TileColor | null)[][] => {
  const height = board.length;
  const width = board[0]?.length || 0;
  const newBoard = board.map((row) => [...row]);

  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = getRandomTileColor();
      }
    }
  }

  return newBoard;
};

/**
 * Process cascades - remove matches, apply gravity, spawn tiles, repeat until no matches
 * Each match group (3/4/5 tiles) is scored separately
 * Cascade matches (from new tiles falling) are also scored
 */
const processCascade = (
  board: (TileColor | null)[][]
): { board: (TileColor | null)[][]; totalScore: number } => {
  let currentBoard = board.map((row) => [...row]);
  let totalScore = 0;
  let cascadeLevel = 0;

  while (true) {
    // Find matches and calculate score for each match group
    const { matched, score: levelScore } = findMatchesWithScore(currentBoard);

    if (matched.size === 0) {
      break;
    }

    // Add cascade bonus: +5 points per cascade level
    const cascadeBonus = cascadeLevel * 5;
    totalScore += levelScore + cascadeBonus;

    // Remove matched tiles
    matched.forEach((pos) => {
      const [row, col] = pos.split(',').map(Number);
      currentBoard[row][col] = null;
    });

    // Apply gravity
    currentBoard = applyGravity(currentBoard);

    // Spawn new tiles
    currentBoard = spawnNewTiles(currentBoard);

    cascadeLevel++;
  }

  return { board: currentBoard, totalScore };
};

/**
 * Check if board has any matches
 */
const hasMatches = (board: (TileColor | null)[][]): boolean => {
  return findMatches(board).size > 0;
};

/**
 * Check if a swap would create at least one match
 */
export const isValidSwap = (
  board: (TileColor | null)[][],
  pos1: { row: number; col: number },
  pos2: { row: number; col: number }
): boolean => {
  if (!areAdjacent(pos1, pos2)) {
    return false;
  }

  // Create a copy of the board and swap tiles
  const testBoard = board.map((row) => [...row]);
  const temp = testBoard[pos1.row][pos1.col];
  testBoard[pos1.row][pos1.col] = testBoard[pos2.row][pos2.col];
  testBoard[pos2.row][pos2.col] = temp;

  // Check if swap creates matches
  return hasMatches(testBoard);
};

/**
 * Check if board has at least one valid move
 */
const hasValidMoves = (board: (TileColor | null)[][]): boolean => {
  const height = board.length;
  const width = board[0]?.length || 0;

  // Check all possible adjacent swaps
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const pos1 = { row, col };

      // Check right neighbor
      if (col < width - 1) {
        const pos2 = { row, col: col + 1 };
        if (isValidSwap(board, pos1, pos2)) {
          return true;
        }
      }

      // Check bottom neighbor
      if (row < height - 1) {
        const pos2 = { row: row + 1, col };
        if (isValidSwap(board, pos1, pos2)) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Generate a valid board with no initial matches
 */
const generateValidBoard = (width: number, height: number): (TileColor | null)[][] => {
  let board: (TileColor | null)[][];
  let attempts = 0;
  const maxAttempts = 100;

  do {
    board = [];
    for (let row = 0; row < height; row++) {
      board[row] = [];
      for (let col = 0; col < width; col++) {
        // Try to avoid creating matches during generation
        let color = getRandomTileColor();
        let attempts = 0;
        while (attempts < 10) {
          // Check if this color would create a horizontal match
          const wouldMatchHorizontal =
            col >= 2 && board[row][col - 1] === color && board[row][col - 2] === color;

          // Check if this color would create a vertical match
          const wouldMatchVertical =
            row >= 2 && board[row - 1][col] === color && board[row - 2][col] === color;

          if (!wouldMatchHorizontal && !wouldMatchVertical) {
            break;
          }
          color = getRandomTileColor();
          attempts++;
        }
        board[row][col] = color;
      }
    }
    attempts++;
  } while (hasMatches(board) && attempts < maxAttempts);

  // If still has matches, remove them
  if (hasMatches(board)) {
    const matches = findMatches(board);
    matches.forEach((pos) => {
      const [row, col] = pos.split(',').map(Number);
      board[row][col] = getRandomTileColor();
    });
  }

  return board;
};

/**
 * Initialize a new Match 3 game
 */
export const initializeMatch3Game = (
  width: number,
  height: number,
  timeLimit: number = DEFAULT_TIME_LIMIT
): Match3GameState => {
  const board = generateValidBoard(width, height);

  return {
    board,
    score: 0,
    moves: 0,
    timeRemaining: timeLimit,
    gameStatus: 'playing',
    boardWidth: width,
    boardHeight: height,
    selectedTile: null,
  };
};

/**
 * Swap two tiles on the board
 */
export const swapTiles = (
  state: Match3GameState,
  pos1: { row: number; col: number },
  pos2: { row: number; col: number }
): Match3GameState | null => {
  if (state.gameStatus !== 'playing') {
    return null;
  }

  if (!areAdjacent(pos1, pos2)) {
    return null;
  }

  // Validate swap
  if (!isValidSwap(state.board, pos1, pos2)) {
    return null;
  }

  // Create new board and swap tiles
  const newBoard = state.board.map((row) => [...row]);
  const temp = newBoard[pos1.row][pos1.col];
  newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col];
  newBoard[pos2.row][pos2.col] = temp;

  // Process matches and cascades
  const { board: finalBoard, totalScore } = processCascade(newBoard);

  // Check if board has valid moves
  const hasMoves = hasValidMoves(finalBoard);

  let gameStatus: Match3GameStatus = 'playing';
  if (!hasMoves) {
    gameStatus = 'no-moves';
  }

  return {
    ...state,
    board: finalBoard,
    score: state.score + totalScore,
    moves: state.moves + 1,
    gameStatus,
    selectedTile: null,
  };
};

/**
 * Reset Match 3 game
 */
export const resetMatch3Game = (
  width: number,
  height: number,
  timeLimit: number = DEFAULT_TIME_LIMIT
): Match3GameState => {
  return initializeMatch3Game(width, height, timeLimit);
};

/**
 * Update timer - decrement time remaining
 */
export const updateTimer = (state: Match3GameState): Match3GameState => {
  if (state.gameStatus !== 'playing') {
    return state;
  }

  const newTimeRemaining = Math.max(0, state.timeRemaining - 1);
  let gameStatus: Match3GameStatus = state.gameStatus;

  if (newTimeRemaining === 0) {
    gameStatus = 'time-up';
  }

  return {
    ...state,
    timeRemaining: newTimeRemaining,
    gameStatus,
  };
};
