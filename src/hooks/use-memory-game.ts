import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BoardCell } from '@/types/board';
import type { MemoryGameState } from '@/types/game-state';
import {
  initializeMemoryGame,
  flipCard,
  processFlippedCards,
  flipCardsBack,
  resetMemoryGame,
  updateTimer,
  getFlipBackDelay,
} from '@/games/memory-game/memory-game';

interface UseMemoryGameProps {
  width: number;
  height: number;
  enabled: boolean;
  timeLimit?: number;
}

interface UseMemoryGameReturn {
  gameState: MemoryGameState | null;
  boardCells: BoardCell[][];
  handleCardClick: (row: number, col: number) => void;
  handleMoveSelection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleCardSelect: () => void;
  handleReset: () => void;
  getStatusMessage: () => string | null;
  isGameEnded: boolean;
  getSerializableState: () => MemoryGameState | null;
  restoreState: (state: MemoryGameState) => void;
}

const DEFAULT_TIME_LIMIT = 300; // 5 minutes

/**
 * Custom hook for Memory Card game logic and rendering helpers
 */
export const useMemoryGame = ({
  width,
  height,
  enabled,
  timeLimit = DEFAULT_TIME_LIMIT,
}: UseMemoryGameProps): UseMemoryGameReturn => {
  const [gameState, setGameState] = useState<MemoryGameState | null>(null);
  const [isFlippingBack, setIsFlippingBack] = useState(false);
  const [keyboardPosition, setKeyboardPosition] = useState<{ row: number; col: number } | null>(
    null
  );

  // Initialize game when enabled or board size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (enabled && width > 0 && height > 0) {
        const initial = initializeMemoryGame(width, height, timeLimit);
        setGameState(initial);
        // Initialize keyboard position to top-left (0,0)
        setKeyboardPosition({ row: 0, col: 0 });
      } else {
        setGameState(null);
        setKeyboardPosition(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [enabled, width, height, timeLimit]);

  // Ensure keyboard position is always set when game is active
  useEffect(() => {
    if (enabled && gameState?.gameStatus === 'playing' && !keyboardPosition) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setKeyboardPosition({ row: 0, col: 0 });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [enabled, gameState?.gameStatus, keyboardPosition]);

  // Timer countdown
  useEffect(() => {
    if (!enabled || !gameState || gameState.gameStatus !== 'playing') {
      return;
    }

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.gameStatus !== 'playing') return prev;
        return updateTimer(prev);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, gameState]);

  // Handle card click (flip card)
  const handleCardClick = useCallback(
    (row: number, col: number) => {
      if (!gameState || gameState.gameStatus !== 'playing' || isFlippingBack) {
        return;
      }

      // Try to flip the card
      const newState = flipCard(gameState, row, col);
      if (!newState) {
        return; // Invalid flip (already flipped, matched, or 2 cards already flipped)
      }

      setGameState(newState);

      // If we now have 2 cards flipped, process them
      if (newState.flippedCards.length === 2) {
        const { newState: processedState, shouldFlipBack } = processFlippedCards(newState);
        setGameState(processedState);

        if (shouldFlipBack) {
          // Flip cards back after delay
          setIsFlippingBack(true);
          setTimeout(() => {
            setGameState((prev) => {
              if (!prev) return prev;
              return flipCardsBack(prev);
            });
            setIsFlippingBack(false);
          }, getFlipBackDelay());
        }
      }
    },
    [gameState, isFlippingBack]
  );

  // Handle keyboard navigation (arrow keys)
  const handleMoveSelection = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!enabled || !gameState || gameState.gameStatus !== 'playing') {
        return;
      }

      // Use keyboard position if exists, otherwise start at 0,0
      const current = keyboardPosition || { row: 0, col: 0 };
      let newRow = current.row;
      let newCol = current.col;

      switch (direction) {
        case 'up':
          newRow = Math.max(0, current.row - 1);
          break;
        case 'down':
          newRow = Math.min(gameState.boardHeight - 1, current.row + 1);
          break;
        case 'left':
          newCol = Math.max(0, current.col - 1);
          break;
        case 'right':
          newCol = Math.min(gameState.boardWidth - 1, current.col + 1);
          break;
      }

      // Update keyboard position (for visual feedback)
      setKeyboardPosition({ row: newRow, col: newCol });
    },
    [enabled, gameState, keyboardPosition]
  );

  // Handle Enter key to flip card at keyboard position
  const handleCardSelect = useCallback(() => {
    if (!enabled || !gameState || gameState.gameStatus !== 'playing' || isFlippingBack) {
      return;
    }

    // Use keyboard position as current position
    const currentPos = keyboardPosition || { row: 0, col: 0 };

    // Flip the card at keyboard position
    handleCardClick(currentPos.row, currentPos.col);
  }, [enabled, gameState, keyboardPosition, isFlippingBack, handleCardClick]);

  // Get card color - always white for simplicity
  const getCardColor = useCallback((value: number | null): string | null => {
    if (value === null) return null;
    // Always return white background
    return '#ffffff';
  }, []);

  // Convert game state to board cells for rendering
  const boardCells = useMemo<BoardCell[][]>(() => {
    if (!enabled || !gameState) {
      return [];
    }

    const cells: BoardCell[][] = [];
    const { boardHeight, boardWidth, board, flippedCards, matchedPairs } = gameState;

    // Pre-allocate arrays
    for (let row = 0; row < boardHeight; row++) {
      cells[row] = new Array(boardWidth);
    }

    // Initialize all cells
    for (let row = 0; row < boardHeight; row++) {
      for (let col = 0; col < boardWidth; col++) {
        const cardValue = board[row]?.[col];
        const isCurrentlyFlipped = flippedCards.some(
          (card) => card.row === row && card.col === col
        );
        const isMatched = cardValue !== null && matchedPairs.includes(cardValue);
        // Matched cards stay flipped (visible), or currently flipped cards
        const isFlipped = isMatched || isCurrentlyFlipped;
        const isKeyboardPosition = keyboardPosition?.row === row && keyboardPosition?.col === col;

        const cardColor = cardValue !== null ? getCardColor(cardValue) : null;
        // Use grey[300] directly to avoid dependency issue
        const cardBackColor = !isFlipped ? '#ffffff' : null;

        cells[row][col] = {
          row,
          col,
          // White background when flipped, grey when face-down
          color: isFlipped && cardColor ? cardColor : cardBackColor,
          selected: isFlipped || isKeyboardPosition, // Highlight flipped cards and keyboard position
          disabled: gameState.gameStatus !== 'playing' || isFlippingBack || isMatched,
          isFlipped, // Card is face-up (flipped or matched)
          isMatched, // Card is matched (stays visible)
          isRemoved: false, // Cards are never removed, just stay visible when matched
          cardValue: isFlipped && cardValue !== null ? cardValue : null, // Show value when flipped or matched
          isKeyboardPosition, // Keyboard navigation position (always highlight)
        };
      }
    }

    return cells;
  }, [enabled, gameState, getCardColor, isFlippingBack, keyboardPosition]);

  // Check if game is ended
  const isGameEnded = useMemo(() => {
    return gameState?.gameStatus !== 'playing';
  }, [gameState]);

  // Get status message
  const getStatusMessage = useCallback((): string | null => {
    if (!gameState) return null;

    if (gameState.gameStatus === 'completed') {
      return `Hoàn thành! Tìm thấy tất cả ${gameState.matchedPairs.length} cặp thẻ.`;
    }
    if (gameState.gameStatus === 'time-up') {
      return `Hết thời gian! Tìm thấy ${gameState.matchedPairs.length} cặp thẻ.`;
    }

    const pairsFound = gameState.matchedPairs.length;
    const totalPairs = (gameState.boardWidth * gameState.boardHeight) / 2;
    return `Đã tìm: ${pairsFound}/${totalPairs} cặp | Điểm: ${gameState.score} | Nước đi: ${gameState.moves} | Thời gian: ${Math.floor(gameState.timeRemaining / 60)}:${String(gameState.timeRemaining % 60).padStart(2, '0')}`;
  }, [gameState]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (!enabled || !width || !height) return;
    const newState = resetMemoryGame(width, height, timeLimit);
    setGameState(newState);
    setIsFlippingBack(false);
    setKeyboardPosition({ row: 0, col: 0 });
  }, [enabled, width, height, timeLimit]);

  // Get serializable state for save/load
  const getSerializableState = useCallback((): MemoryGameState | null => {
    return gameState;
  }, [gameState]);

  // Restore state from save
  const restoreState = useCallback((state: MemoryGameState) => {
    setGameState(state);
    setIsFlippingBack(false);
    setKeyboardPosition({ row: 0, col: 0 });
  }, []);

  return {
    gameState,
    boardCells,
    handleCardClick,
    handleMoveSelection,
    handleCardSelect,
    handleReset,
    getStatusMessage,
    isGameEnded,
    getSerializableState,
    restoreState,
  };
};
