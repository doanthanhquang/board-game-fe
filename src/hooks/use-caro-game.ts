/**
 * Custom hook for Caro game logic
 * Manages game state, moves, AI turns, and game flow
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { CaroGameState } from '@/types/game-state';
import type { BoardCell } from '@/types/board';
import { initializeGame, makeMove, resetGame } from '@/games/caro/caro-game';
import { makeAIMove } from '@/games/caro/caro-ai';
import { useTheme } from '@mui/material/styles';

interface UseCaroGameProps {
  width: number;
  height: number;
  enabled: boolean;
  playerIcon?: 'X' | 'O'; // Player's icon choice
  targetInRow?: number; // Number of pieces in a row needed to win (default: 4)
}

interface UseCaroGameReturn {
  gameState: CaroGameState | null;
  boardCells: BoardCell[][];
  isAITurn: boolean;
  handleCellClick: (row: number, col: number) => void;
  handleReset: () => void;
  getStatusMessage: () => string | null;
  isGameEnded: boolean;
  playerIcon: 'X' | 'O' | undefined;
  computerIcon: 'X' | 'O' | undefined;
  // Persistence helpers
  getSerializableState: () => CaroGameState | null;
  restoreState: (state: CaroGameState) => void;
}

/**
 * Custom hook for managing caro game state and logic
 */
export function useCaroGame({
  width,
  height,
  enabled,
  playerIcon = 'X',
  targetInRow = 4,
}: UseCaroGameProps): UseCaroGameReturn {
  const theme = useTheme();
  const [gameState, setGameState] = useState<CaroGameState | null>(null);
  const [isAITurn, setIsAITurn] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | undefined>(
    undefined
  );
  // Use ref to track gameState for AI turn without causing re-renders
  const gameStateRef = useRef<CaroGameState | null>(null);
  // Track if AI is processing to avoid duplicate triggers
  const aiProcessingRef = useRef(false);

  // Determine computer icon based on player icon
  const computerIcon = playerIcon === 'X' ? 'O' : 'X';

  // Initialize game when enabled
  useEffect(() => {
    if (enabled) {
      const initialState = initializeGame(width, height);
      setGameState(initialState);
      gameStateRef.current = initialState;
      setSelectedCell(undefined);
      setIsAITurn(false);
      aiProcessingRef.current = false;
    }
  }, [enabled, width, height]);

  // Update ref when gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Handle AI turn
  useEffect(() => {
    // Only proceed if conditions are met
    if (
      !enabled ||
      !gameState ||
      gameState.currentPlayer !== 'computer' ||
      gameState.gameStatus !== 'playing' ||
      // isAITurn ||
      aiProcessingRef.current
    ) {
      return;
    }

    // Mark AI as processing
    aiProcessingRef.current = true;
    // Set AI turn flag immediately
    setIsAITurn(true);

    // Add small delay for better UX
    const timer = setTimeout(() => {
      try {
        // Lấy state bàn cờ mới nhất từ ref
        const stateForMove = gameStateRef.current;
        if (!stateForMove) {
          console.error('Không có trạng thái game cho lượt đi của máy');
          setIsAITurn(false);
          aiProcessingRef.current = false;
          return;
        }

        // Kiểm tra lại có còn đúng lượt của máy hay không
        if (stateForMove.currentPlayer !== 'computer' || stateForMove.gameStatus !== 'playing') {
          console.log('Trạng thái game đã thay đổi, bỏ qua lượt đi của máy');
          setIsAITurn(false);
          aiProcessingRef.current = false;
          return;
        }

        const aiMove = makeAIMove(stateForMove.board);

        if (aiMove) {
          const newState = makeMove(stateForMove, aiMove.row, aiMove.col, targetInRow);
          if (newState) {
            setGameState(newState);
            gameStateRef.current = newState;
          } else {
            console.error('Không thực hiện được nước đi của máy: nước đi không hợp lệ');
          }
        } else {
          console.error('Không còn nước đi hợp lệ cho máy');
        }
      } catch (error) {
        console.error('Lỗi khi xử lý nước đi của máy:', error);
      } finally {
        // Always reset AI turn flag and processing flag
        setIsAITurn(false);
        aiProcessingRef.current = false;
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      // Reset processing flag if effect is cleaned up
      aiProcessingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, gameState?.currentPlayer, gameState?.gameStatus, isAITurn]);

  // Handle cell click
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!enabled || !gameState) return;

      // Only allow moves during player's turn and when game is playing
      if (gameState.currentPlayer === 'player' && gameState.gameStatus === 'playing' && !isAITurn) {
        const newState = makeMove(gameState, row, col, targetInRow);
        if (newState) {
          setGameState(newState);
          setSelectedCell(undefined);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, gameState, isAITurn]
  );

  // Handle game reset
  const handleReset = useCallback(() => {
    if (enabled) {
      const newState = resetGame(width, height);
      setGameState(newState);
      setSelectedCell(undefined);
      setIsAITurn(false);
    }
  }, [enabled, width, height]);

  // Get game status message
  const getStatusMessage = useCallback((): string | null => {
    if (!enabled || !gameState) return null;

    if (gameState.gameStatus === 'player-won') {
      return '🎉 Bạn đã thắng!';
    }
    if (gameState.gameStatus === 'computer-won') {
      return '😔 Máy đã thắng!';
    }
    if (gameState.gameStatus === 'draw') {
      return '🤝 Hòa!';
    }
    if (isAITurn) {
      return 'Máy đang suy nghĩ...';
    }
    return gameState.currentPlayer === 'player' ? 'Lượt của bạn' : 'Lượt của máy';
  }, [enabled, gameState, isAITurn]);

  // Check if game is ended
  const isGameEnded = useMemo(() => {
    return gameState?.gameStatus !== 'playing';
  }, [gameState]);

  const getSerializableState = useCallback((): CaroGameState | null => {
    if (!gameState) return null;
    return gameState;
  }, [gameState]);

  const restoreState = useCallback(
    (state: CaroGameState) => {
      if (!enabled) return;
      setGameState(state);
      gameStateRef.current = state;
      setSelectedCell(undefined);
      setIsAITurn(false);
      aiProcessingRef.current = false;
    },
    [enabled]
  );

  // Generate board cells from game state
  const boardCells = useMemo<BoardCell[][]>(() => {
    if (!enabled || !gameState) return [];

    const cells: BoardCell[][] = [];
    for (let row = 0; row < height; row++) {
      cells[row] = [];
      for (let col = 0; col < width; col++) {
        const piece = gameState.board[row]?.[col];
        // Set color based on piece - this color should NEVER change once set
        let color: string | null = null;
        let disabled = false;

        // Color and icon are determined by the piece on the board - permanent once set
        let movePlayer: 'player' | 'computer' | undefined = undefined;
        let icon: 'X' | 'O' | null = null;
        if (piece === 'player') {
          // Player pieces are always primary color (blue)
          color = theme.palette.primary.main;
          movePlayer = 'player';
          icon = playerIcon;
          disabled = true;
        } else if (piece === 'computer') {
          // Computer pieces are always error color (red)
          color = theme.palette.error.main;
          movePlayer = 'computer';
          icon = computerIcon;
          disabled = true;
        }
        // If piece is null, color and icon remain null (transparent)

        // Disable cells if game ended or during AI turn
        if (
          gameState.gameStatus !== 'playing' ||
          isAITurn ||
          gameState.currentPlayer === 'computer'
        ) {
          disabled = true;
        }

        // Check if this is the last move (for extra highlight)
        const isLastMove = gameState.lastMove?.row === row && gameState.lastMove?.col === col;

        // Only show selected state for empty cells (no piece)
        const isSelected = selectedCell?.row === row && selectedCell?.col === col && !piece;

        cells[row][col] = {
          row,
          col,
          color, // This color is permanent for cells with pieces
          selected: isSelected,
          disabled,
          isLastMove, // Extra highlight for last move
          movePlayer, // Track which player made the move for border color
          icon, // X or O icon for caro game
        };
      }
    }
    return cells;
  }, [enabled, gameState, selectedCell, isAITurn, width, height, theme, playerIcon, computerIcon]);

  return {
    gameState,
    boardCells,
    isAITurn,
    handleCellClick,
    handleReset,
    getStatusMessage,
    isGameEnded,
    playerIcon,
    computerIcon,
    getSerializableState,
    restoreState,
  };
}
