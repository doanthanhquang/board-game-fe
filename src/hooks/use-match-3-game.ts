import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import type { BoardCell } from '@/types/board';
import type { Match3GameState, TileColor } from '@/types/game-state';
import {
  initializeMatch3Game,
  swapTiles,
  resetMatch3Game,
  updateTimer,
  isValidSwap,
} from '@/games/match-3/match-3-game';

interface UseMatch3GameProps {
  width: number;
  height: number;
  enabled: boolean;
  timeLimit?: number;
}

interface UseMatch3GameReturn {
  gameState: Match3GameState | null;
  boardCells: BoardCell[][];
  handleTileClick: (row: number, col: number) => void;
  handleTileDragStart: (row: number, col: number) => void;
  handleTileDragEnd: (row: number, col: number) => void;
  handleTileDragOver: (row: number, col: number) => void;
  handleTileDrop: (row: number, col: number) => void;
  handleMoveSelection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleSwapSelected: () => void;
  handleReset: () => void;
  getStatusMessage: () => string | null;
  isGameEnded: boolean;
  getSerializableState: () => Match3GameState | null;
  restoreState: (state: Match3GameState) => void;
}

const DEFAULT_TIME_LIMIT = 300; // 5 minutes

/**
 * Custom hook for Match 3 game logic and rendering helpers
 */
export const useMatch3Game = ({
  width,
  height,
  enabled,
  timeLimit = DEFAULT_TIME_LIMIT,
}: UseMatch3GameProps): UseMatch3GameReturn => {
  const theme = useTheme();
  const [gameState, setGameState] = useState<Match3GameState | null>(null);
  const [invalidSwapFeedback, setInvalidSwapFeedback] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [animationState, setAnimationState] = useState<{
    swapping: Set<string>; // Set of "row,col" positions being swapped
    falling: Map<string, number>; // Map of "row,col" to fallFromRow
    matched: Set<string>; // Set of "row,col" positions being matched
  }>({
    swapping: new Set(),
    falling: new Map(),
    matched: new Set(),
  });
  const [draggingTile, setDraggingTile] = useState<{ row: number; col: number } | null>(null);
  const [keyboardPosition, setKeyboardPosition] = useState<{ row: number; col: number } | null>(
    null
  );

  // Initialize game when enabled or board size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (enabled && width > 0 && height > 0) {
        const initial = initializeMatch3Game(width, height, timeLimit);
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

  // Clear invalid swap feedback after animation
  useEffect(() => {
    if (invalidSwapFeedback) {
      const timer = setTimeout(() => {
        setInvalidSwapFeedback(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [invalidSwapFeedback]);

  // Calculate which tiles are falling by comparing old and new board
  const calculateFallingTiles = useCallback(
    (oldBoard: (TileColor | null)[][], newBoard: (TileColor | null)[][]): Map<string, number> => {
      const fallingMap = new Map<string, number>();
      const height = oldBoard.length;
      const width = oldBoard[0]?.length || 0;

      // For each column, calculate falling tiles
      for (let col = 0; col < width; col++) {
        // Create a map of old board tiles in this column (row -> tile)
        const oldColumnTiles: Array<{ row: number; tile: TileColor }> = [];
        for (let row = 0; row < height; row++) {
          if (oldBoard[row][col] !== null) {
            oldColumnTiles.push({ row, tile: oldBoard[row][col]! });
          }
        }

        // Match new board tiles with old board tiles (from bottom up)
        let oldIndex = oldColumnTiles.length - 1;
        for (let newRow = height - 1; newRow >= 0; newRow--) {
          const newTile = newBoard[newRow][col];
          if (newTile === null) continue;

          // Try to find matching tile in old column (from bottom up)
          if (oldIndex >= 0 && oldColumnTiles[oldIndex].tile === newTile) {
            const oldRow = oldColumnTiles[oldIndex].row;
            // If tile moved down, add to falling map
            if (oldRow < newRow) {
              const key = `${newRow},${col}`;
              fallingMap.set(key, oldRow);
            }
            oldIndex--;
          } else {
            // New tile spawned (not in old board), skip
            // This tile doesn't need falling animation
          }
        }
      }

      return fallingMap;
    },
    []
  );

  // Find matched tiles before removal
  const findMatchedTiles = useCallback((board: (TileColor | null)[][]): Set<string> => {
    const matches = new Set<string>();
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
            for (let i = col - count; i < col; i++) {
              matches.add(`${row},${i}`);
            }
          }
          count = 1;
          currentColor = tile;
        }
      }
      if (count >= 3 && currentColor !== null) {
        for (let i = width - count; i < width; i++) {
          matches.add(`${row},${i}`);
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
            for (let i = row - count; i < row; i++) {
              matches.add(`${i},${col}`);
            }
          }
          count = 1;
          currentColor = tile;
        }
      }
      if (count >= 3 && currentColor !== null) {
        for (let i = height - count; i < height; i++) {
          matches.add(`${i},${col}`);
        }
      }
    }

    return matches;
  }, []);

  // Animated swap with visual feedback
  const performSwap = useCallback(
    (pos1: { row: number; col: number }, pos2: { row: number; col: number }) => {
      if (!gameState) return;

      // Check if swap is valid
      if (!isValidSwap(gameState.board, pos1, pos2)) {
        setInvalidSwapFeedback(pos2);
        setGameState({
          ...gameState,
          selectedTile: null,
        });
        return;
      }

      // Create a copy of board for swap animation
      const swappedBoard = gameState.board.map((row) => [...row]);
      const temp = swappedBoard[pos1.row][pos1.col];
      swappedBoard[pos1.row][pos1.col] = swappedBoard[pos2.row][pos2.col];
      swappedBoard[pos2.row][pos2.col] = temp;

      // Start swap animation
      const key1 = `${pos1.row},${pos1.col}`;
      const key2 = `${pos2.row},${pos2.col}`;
      setAnimationState((prev) => ({
        ...prev,
        swapping: new Set([key1, key2]),
      }));

      // After swap animation, find matches and animate removal
      setTimeout(() => {
        const matchedTiles = findMatchedTiles(swappedBoard);
        setAnimationState((animState) => ({
          ...animState,
          swapping: new Set(),
          matched: matchedTiles,
        }));

        // After match animation, apply the actual swap and process cascade
        setTimeout(() => {
          setGameState((prev) => {
            if (!prev) return prev;
            const oldBoard = prev.board.map((row) => [...row]);
            const result = swapTiles(prev, pos1, pos2);
            if (result) {
              // Calculate falling tiles by comparing old and new board
              const fallingMap = calculateFallingTiles(oldBoard, result.board);

              setAnimationState((animState) => ({
                ...animState,
                matched: new Set(),
                falling: fallingMap,
              }));

              // Clear falling animation after it completes
              setTimeout(() => {
                setAnimationState((animState) => ({
                  ...animState,
                  falling: new Map(),
                }));
              }, 600);

              return result;
            }
            return prev;
          });
        }, 300); // Match removal animation duration
      }, 300); // Swap animation duration
    },
    [gameState, findMatchedTiles, calculateFallingTiles]
  );

  const handleTileClick = useCallback(
    (row: number, col: number) => {
      if (!enabled || !gameState || gameState.gameStatus !== 'playing') {
        return;
      }

      const clickedPos = { row, col };

      // If no tile is selected, select this tile
      if (gameState.selectedTile === null) {
        setGameState({
          ...gameState,
          selectedTile: clickedPos,
        });
        return;
      }

      // If same tile is clicked, deselect
      if (gameState.selectedTile.row === row && gameState.selectedTile.col === col) {
        setGameState({
          ...gameState,
          selectedTile: null,
        });
        return;
      }

      // If adjacent tile is clicked, try to swap
      const selectedPos = gameState.selectedTile;
      if (
        (Math.abs(selectedPos.row - row) === 1 && selectedPos.col === col) ||
        (Math.abs(selectedPos.col - col) === 1 && selectedPos.row === row)
      ) {
        performSwap(selectedPos, clickedPos);
      } else {
        // Non-adjacent tile clicked - select new tile
        setGameState({
          ...gameState,
          selectedTile: clickedPos,
        });
      }
    },
    [enabled, gameState, performSwap]
  );

  const handleTileDragStart = useCallback(
    (row: number, col: number) => {
      if (!enabled || !gameState || gameState.gameStatus !== 'playing') {
        return;
      }
      setDraggingTile({ row, col });
      setGameState({
        ...gameState,
        selectedTile: { row, col },
      });
    },
    [enabled, gameState]
  );

  const handleTileDragEnd = useCallback(() => {
    setDraggingTile(null);
  }, []);

  const handleTileDrop = useCallback(
    (row: number, col: number) => {
      if (!enabled || !gameState || !draggingTile || gameState.gameStatus !== 'playing') {
        setDraggingTile(null);
        return;
      }

      const startPos = draggingTile;
      const endPos = { row, col };

      // Check if dragged to adjacent tile
      if (
        (Math.abs(startPos.row - row) === 1 && startPos.col === col) ||
        (Math.abs(startPos.col - col) === 1 && startPos.row === row)
      ) {
        performSwap(startPos, endPos);
      } else {
        // Not adjacent, just select the end tile
        setGameState({
          ...gameState,
          selectedTile: endPos,
        });
      }

      setDraggingTile(null);
    },
    [enabled, gameState, draggingTile, performSwap]
  );

  const handleTileDragOver = useCallback(() => {
    if (!draggingTile) return;
    // Visual feedback during drag (could highlight valid drop zones)
  }, [draggingTile]);

  const handleMoveSelection = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!enabled || !gameState || gameState.gameStatus !== 'playing') {
        return;
      }

      // Use keyboard position if exists, otherwise use selectedTile or start at 0,0
      const current = keyboardPosition || gameState.selectedTile || { row: 0, col: 0 };
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

  const handleSwapSelected = useCallback(() => {
    if (!enabled || !gameState || gameState.gameStatus !== 'playing') {
      return;
    }

    // Use keyboard position as current position
    const currentPos = keyboardPosition || { row: 0, col: 0 };

    // If no tile is selected yet, select the current position
    if (gameState.selectedTile === null) {
      setGameState({
        ...gameState,
        selectedTile: currentPos,
      });
      return;
    }

    // If same tile is selected, deselect
    const selected = gameState.selectedTile;
    if (selected.row === currentPos.row && selected.col === currentPos.col) {
      setGameState({
        ...gameState,
        selectedTile: null,
      });
      return;
    }

    // Check if current position is adjacent to selected tile
    const isAdjacent =
      (Math.abs(selected.row - currentPos.row) === 1 && selected.col === currentPos.col) ||
      (Math.abs(selected.col - currentPos.col) === 1 && selected.row === currentPos.row);

    if (isAdjacent) {
      // Swap with adjacent tile
      performSwap(selected, currentPos);
    } else {
      // Not adjacent, just select the new position
      setGameState({
        ...gameState,
        selectedTile: currentPos,
      });
    }
  }, [enabled, gameState, keyboardPosition, performSwap]);

  const handleReset = useCallback(() => {
    if (!enabled) return;
    const reset = resetMatch3Game(width, height, timeLimit);
    setGameState(reset);
    setKeyboardPosition({ row: 0, col: 0 });
    setAnimationState({
      swapping: new Set(),
      falling: new Map(),
      matched: new Set(),
    });
  }, [enabled, width, height, timeLimit]);

  const getStatusMessage = useCallback((): string | null => {
    if (!enabled || !gameState) return null;

    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    switch (gameState.gameStatus) {
      case 'time-up':
        return `⏰ Hết giờ! Điểm: ${gameState.score}`;
      case 'no-moves':
        return `🚫 Hết nước đi! Điểm: ${gameState.score}`;
      case 'game-over':
        return `Kết thúc · Điểm: ${gameState.score}`;
      case 'playing':
      default:
        return `Đang chơi · Điểm: ${gameState.score} · Thời gian: ${timeStr}`;
    }
  }, [enabled, gameState]);

  const isGameEnded = useMemo(() => {
    return gameState ? gameState.gameStatus !== 'playing' : false;
  }, [gameState]);

  // Map tile colors to theme colors
  const getTileColor = useCallback(
    (tileColor: TileColor): string => {
      const colorMap: Record<TileColor, string> = {
        red: theme.palette.error.main,
        blue: theme.palette.info.main,
        green: theme.palette.success.main,
        yellow: theme.palette.warning.main,
        purple: theme.palette.secondary.main,
        orange: '#ff9800', // Orange color
      };
      return colorMap[tileColor];
    },
    [theme]
  );

  const boardCells = useMemo<BoardCell[][]>(() => {
    if (!enabled || !gameState) return [];

    const cells: BoardCell[][] = [];
    const { boardHeight, boardWidth, board, selectedTile } = gameState;

    // Pre-allocate arrays
    for (let row = 0; row < boardHeight; row++) {
      cells[row] = new Array(boardWidth);
    }

    // Initialize all cells with animation states
    for (let row = 0; row < boardHeight; row++) {
      for (let col = 0; col < boardWidth; col++) {
        const tile = board[row]?.[col];
        const isSelected = selectedTile?.row === row && selectedTile?.col === col;
        const isKeyboardPosition = keyboardPosition?.row === row && keyboardPosition?.col === col;
        const key = `${row},${col}`;
        const isSwapping = animationState.swapping.has(key);
        const isFalling = animationState.falling.has(key);
        const fallFromRow = animationState.falling.get(key);
        const isMatched = animationState.matched.has(key);
        const isDragging = draggingTile?.row === row && draggingTile?.col === col;

        cells[row][col] = {
          row,
          col,
          color: tile ? getTileColor(tile) : null,
          selected: isSelected, // Selected tile (for swap)
          disabled: gameState.gameStatus !== 'playing',
          isSwapping,
          isFalling,
          fallFromRow,
          isMatched,
          isDragging,
          isKeyboardPosition, // Keyboard navigation position (always highlight)
        };
      }
    }

    return cells;
  }, [enabled, gameState, getTileColor, animationState, draggingTile, keyboardPosition]);

  const getSerializableState = useCallback((): Match3GameState | null => {
    if (!gameState) return null;
    return gameState;
  }, [gameState]);

  const restoreState = useCallback(
    (state: Match3GameState) => {
      if (!enabled) return;
      setGameState(state);
      // Reset keyboard position when restoring state
      setKeyboardPosition(state.selectedTile || { row: 0, col: 0 });
    },
    [enabled]
  );

  return {
    gameState,
    boardCells,
    handleTileClick,
    handleTileDragStart,
    handleTileDragEnd,
    handleTileDragOver,
    handleTileDrop,
    handleMoveSelection,
    handleSwapSelected,
    handleReset,
    getStatusMessage,
    isGameEnded,
    getSerializableState,
    restoreState,
  };
};
