/**
 * Memory Card game logic
 * Manages game state and game flow for a Memory Card game (Cờ Trí Nhớ)
 */

export type MemoryGameStatus = 'playing' | 'completed' | 'time-up';

export interface MemoryGameState {
  board: (number | null)[][]; // Card values, null for removed cards
  flippedCards: { row: number; col: number }[]; // Currently flipped cards (max 2)
  matchedPairs: number[]; // Card values that have been matched
  score: number;
  moves: number; // Number of card flip attempts
  timeRemaining: number; // Seconds
  gameStatus: MemoryGameStatus;
  boardWidth: number;
  boardHeight: number;
}

const DEFAULT_TIME_LIMIT = 300; // 5 minutes
const FLIP_BACK_DELAY = 1500; // 1.5 seconds

/**
 * Generate card pairs and randomly distribute them across the board
 */
const generateCardPairs = (width: number, height: number): number[][] => {
  const totalCards = width * height;
  const totalPairs = totalCards / 2;

  // Create array of card values (each value appears twice)
  const cardValues: number[] = [];
  for (let i = 1; i <= totalPairs; i++) {
    cardValues.push(i, i); // Each value appears twice
  }

  // Shuffle array using Fisher-Yates algorithm
  for (let i = cardValues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
  }

  // Place shuffled cards on board (row by row, left to right)
  const board: number[][] = [];
  let cardIndex = 0;
  for (let row = 0; row < height; row++) {
    board[row] = [];
    for (let col = 0; col < width; col++) {
      board[row][col] = cardValues[cardIndex++];
    }
  }

  return board;
};

/**
 * Check if a position is already flipped
 */
const isCardFlipped = (
  flippedCards: { row: number; col: number }[],
  row: number,
  col: number
): boolean => {
  return flippedCards.some((card) => card.row === row && card.col === col);
};

/**
 * Check if a card value has already been matched
 */
const isCardMatched = (matchedPairs: number[], cardValue: number): boolean => {
  return matchedPairs.includes(cardValue);
};

/**
 * Check if two flipped cards match
 */
const checkMatch = (
  board: (number | null)[][],
  flippedCards: { row: number; col: number }[]
): boolean => {
  if (flippedCards.length !== 2) return false;

  const [card1, card2] = flippedCards;
  const value1 = board[card1.row]?.[card1.col];
  const value2 = board[card2.row]?.[card2.col];

  return value1 !== null && value2 !== null && value1 === value2;
};

// Removed: Cards are no longer removed when matched, they stay visible
// const removeMatchedPair = ...

/**
 * Check if game is completed (all pairs found)
 */
const isGameCompleted = (
  matchedPairs: number[],
  boardWidth: number,
  boardHeight: number
): boolean => {
  const totalPairs = (boardWidth * boardHeight) / 2;
  return matchedPairs.length === totalPairs;
};

/**
 * Initialize Memory Card game
 */
export const initializeMemoryGame = (
  width: number,
  height: number,
  timeLimit: number = DEFAULT_TIME_LIMIT
): MemoryGameState => {
  // Validate board dimensions (must be even for pairs)
  if ((width * height) % 2 !== 0) {
    throw new Error('Board dimensions must result in an even number of cards');
  }

  const board = generateCardPairs(width, height);

  return {
    board,
    flippedCards: [],
    matchedPairs: [],
    score: 0,
    moves: 0,
    timeRemaining: timeLimit,
    gameStatus: 'playing',
    boardWidth: width,
    boardHeight: height,
  };
};

/**
 * Flip a card (add to flippedCards if not already flipped and not matched)
 */
export const flipCard = (
  state: MemoryGameState,
  row: number,
  col: number
): MemoryGameState | null => {
  // Game must be playing
  if (state.gameStatus !== 'playing') return null;

  // Card must exist and not be removed
  const cardValue = state.board[row]?.[col];
  if (cardValue === null || cardValue === undefined) return null;

  // Card must not already be matched (matched cards stay visible and can't be flipped again)
  if (isCardMatched(state.matchedPairs, cardValue)) return null;

  // Card must not already be flipped
  if (isCardFlipped(state.flippedCards, row, col)) return null;

  // Can only flip 2 cards at a time
  if (state.flippedCards.length >= 2) return null;

  // Add card to flippedCards
  const newFlippedCards = [...state.flippedCards, { row, col }];

  return {
    ...state,
    flippedCards: newFlippedCards,
  };
};

/**
 * Process match detection and handle matched or non-matched pairs
 * Returns updated state and whether cards should be flipped back
 */
export const processFlippedCards = (
  state: MemoryGameState
): { newState: MemoryGameState; shouldFlipBack: boolean } => {
  // Need exactly 2 flipped cards to process
  if (state.flippedCards.length !== 2) {
    return { newState: state, shouldFlipBack: false };
  }

  const isMatch = checkMatch(state.board, state.flippedCards);

  if (isMatch) {
    // Cards match - keep them visible and update score
    const [card1] = state.flippedCards;
    const matchedValue = state.board[card1.row]?.[card1.col];

    if (matchedValue === null || matchedValue === undefined) {
      return { newState: state, shouldFlipBack: false };
    }

    // Don't remove cards, just mark as matched and keep them flipped
    const newMatchedPairs = [...state.matchedPairs, matchedValue];
    const newScore = state.score + 10;
    const newMoves = state.moves + 1;

    // Check if game is completed
    const completed = isGameCompleted(newMatchedPairs, state.boardWidth, state.boardHeight);

    const newState: MemoryGameState = {
      ...state,
      // Keep board unchanged - cards stay visible
      flippedCards: [], // Clear flipped cards (they're now permanently visible via matchedPairs)
      matchedPairs: newMatchedPairs,
      score: newScore,
      moves: newMoves,
      gameStatus: completed ? 'completed' : 'playing',
    };

    return { newState, shouldFlipBack: false };
  } else {
    // Cards don't match - will flip back after delay
    const newMoves = state.moves + 1;

    const newState: MemoryGameState = {
      ...state,
      moves: newMoves,
      // Keep flippedCards for now (will be cleared after flip-back delay)
    };

    return { newState, shouldFlipBack: true };
  }
};

/**
 * Flip cards back (clear flippedCards)
 */
export const flipCardsBack = (state: MemoryGameState): MemoryGameState => {
  return {
    ...state,
    flippedCards: [],
  };
};

/**
 * Update timer (decrease timeRemaining)
 */
export const updateTimer = (state: MemoryGameState): MemoryGameState => {
  if (state.gameStatus !== 'playing') {
    return state;
  }

  const newTimeRemaining = Math.max(0, state.timeRemaining - 1);
  const isTimeUp = newTimeRemaining === 0;

  return {
    ...state,
    timeRemaining: newTimeRemaining,
    gameStatus: isTimeUp ? 'time-up' : state.gameStatus,
  };
};

/**
 * Reset Memory Card game
 */
export const resetMemoryGame = (
  width: number,
  height: number,
  timeLimit: number = DEFAULT_TIME_LIMIT
): MemoryGameState => {
  return initializeMemoryGame(width, height, timeLimit);
};

/**
 * Get flip-back delay in milliseconds
 */
export const getFlipBackDelay = (): number => {
  return FLIP_BACK_DELAY;
};
