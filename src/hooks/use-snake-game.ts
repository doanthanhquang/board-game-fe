import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import type { BoardCell } from '@/types/board';
import type { SnakeDirection, SnakeGameState } from '@/types/game-state';
import {
  canChangeDirection,
  initializeSnakeGame,
  moveSnake,
  resetSnakeGame,
} from '@/games/snake/snake-game';

interface UseSnakeGameProps {
  width: number;
  height: number;
  enabled: boolean;
  speedMs?: number;
}

interface UseSnakeGameReturn {
  gameState: SnakeGameState | null;
  boardCells: BoardCell[][];
  changeDirection: (direction: SnakeDirection) => void;
  handleReset: () => void;
  handlePause: () => void;
  handleResume: () => void;
  isPaused: boolean;
  getStatusMessage: () => string | null;
  isGameOver: boolean;
  getSerializableState: () => SnakeGameState | null;
  restoreState: (state: SnakeGameState) => void;
}

const DEFAULT_SPEED_MS = 180;

/**
 * Custom hook for Snake game logic and rendering helpers
 */
export const useSnakeGame = ({
  width,
  height,
  enabled,
  speedMs = DEFAULT_SPEED_MS,
}: UseSnakeGameProps): UseSnakeGameReturn => {
  const theme = useTheme();
  const [gameState, setGameState] = useState<SnakeGameState | null>(null);
  const gameStateRef = useRef<SnakeGameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  // Initialize game when enabled or board size changes
  useEffect(() => {
    // Use setTimeout to defer state updates and avoid strict mode warning
    const timer = setTimeout(() => {
      if (enabled && width > 0 && height > 0) {
        const initial = initializeSnakeGame(width, height);
        setGameState(initial);
        gameStateRef.current = initial;
        setIsPaused(false);
        isPausedRef.current = false;
      } else {
        setGameState(null);
        gameStateRef.current = null;
        setIsPaused(false);
        isPausedRef.current = false;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [enabled, width, height]);

  // Keep refs in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Game loop - use requestAnimationFrame for smoother timing
  const speedMsRef = useRef(speedMs);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastUpdateRef.current = Date.now();

    const gameLoop = () => {
      const currentTime = Date.now();
      // Don't move if paused
      if (isPausedRef.current) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const elapsed = currentTime - lastUpdateRef.current;

      if (elapsed >= speedMsRef.current) {
        const currentState = gameStateRef.current;
        if (currentState && currentState.gameStatus === 'playing') {
          const next = moveSnake(currentState);
          gameStateRef.current = next;
          // Update state immediately
          setGameState(next);
        }
        lastUpdateRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  const changeDirection = useCallback((direction: SnakeDirection) => {
    setGameState((prev) => {
      if (!prev || prev.gameStatus !== 'playing') return prev;
      if (!canChangeDirection(prev.direction, direction)) return prev;
      const updated = { ...prev, nextDirection: direction };
      gameStateRef.current = updated;
      return updated;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!enabled) return;
    const reset = resetSnakeGame(width, height);
    setGameState(reset);
    gameStateRef.current = reset;
    setIsPaused(false);
    isPausedRef.current = false;
  }, [enabled, width, height]);

  const handlePause = useCallback(() => {
    if (!enabled || !gameState || gameState.gameStatus !== 'playing') return;
    setIsPaused(true);
    isPausedRef.current = true;
  }, [enabled, gameState]);

  const handleResume = useCallback(() => {
    if (!enabled || !gameState || gameState.gameStatus !== 'playing') return;
    setIsPaused(false);
    isPausedRef.current = false;
  }, [enabled, gameState]);

  const getStatusMessage = useCallback((): string | null => {
    if (!enabled || !gameState) return null;
    if (gameState.gameStatus === 'game-over') {
      return `Game Over · Điểm: ${gameState.score}`;
    }
    if (isPaused) {
      return `⏸️ Tạm dừng · Điểm: ${gameState.score}`;
    }
    return `Đang chơi · Điểm: ${gameState.score}`;
  }, [enabled, gameState, isPaused]);

  const isGameOver = useMemo(() => gameState?.gameStatus === 'game-over', [gameState]);

  // Extract theme colors - these are stable strings, safe to use in memo
  const foodColor = theme.palette.warning.main;
  const snakeHeadColor = theme.palette.primary.dark;
  const snakeBodyColor = theme.palette.primary.main;

  const boardCells = useMemo<BoardCell[][]>(() => {
    if (!enabled || !gameState) return [];

    const cells: BoardCell[][] = [];
    const { boardHeight, boardWidth, food, snake } = gameState;

    // Pre-allocate arrays for better performance
    for (let row = 0; row < boardHeight; row++) {
      cells[row] = new Array(boardWidth);
    }

    // Initialize all cells as empty
    for (let row = 0; row < boardHeight; row++) {
      for (let col = 0; col < boardWidth; col++) {
        cells[row][col] = {
          row,
          col,
          color: null,
          selected: false,
          disabled: true,
        };
      }
    }

    // Render food with special highlighting
    const foodCell = cells[food.row][food.col];
    cells[food.row][food.col] = {
      ...foodCell,
      color: foodColor,
      movePlayer: undefined,
      disabled: true,
      isFood: true,
    };

    // Render snake (head first)
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const cell = cells[segment.row][segment.col];
      cells[segment.row][segment.col] = {
        ...cell,
        color: isHead ? snakeHeadColor : snakeBodyColor,
        movePlayer: 'player',
        isLastMove: isHead,
        disabled: true,
      };
    });

    return cells;
  }, [enabled, gameState, foodColor, snakeHeadColor, snakeBodyColor]);

  const getSerializableState = useCallback((): SnakeGameState | null => {
    if (!gameState) return null;
    return gameState;
  }, [gameState]);

  const restoreState = useCallback(
    (state: SnakeGameState) => {
      if (!enabled) return;
      setGameState(state);
      gameStateRef.current = state;
    },
    [enabled]
  );

  return {
    gameState,
    boardCells,
    changeDirection,
    handleReset,
    handlePause,
    handleResume,
    isPaused,
    getStatusMessage,
    isGameOver,
    getSerializableState,
    restoreState,
  };
};
