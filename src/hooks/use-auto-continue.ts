/**
 * Hook for auto-continue game logic
 */

import { useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';
import { listGameSaves, loadGameSave } from '@/api/games';
import type { GameType } from '@/types/game-types';
import type {
  CaroGameState,
  SnakeGameState,
  Match3GameState,
  MemoryGameState,
} from '@/types/game-state';
import type { TicTacToeGameState } from '@/games/tic-tac-toe/tic-tac-toe-game';

interface GameHookWithRestore<T> {
  restoreState: (state: T) => void;
}

interface UseAutoContinueProps {
  shouldContinue: boolean;
  slug: string | undefined;
  gameType: GameType;
  navigate: NavigateFunction;
  caroGame: GameHookWithRestore<CaroGameState>;
  ticTacToeGame: GameHookWithRestore<TicTacToeGameState>;
  snakeGame: GameHookWithRestore<SnakeGameState>;
  match3Game: GameHookWithRestore<Match3GameState>;
  memoryGame: GameHookWithRestore<MemoryGameState>;
  setShowIconSelector: (show: boolean) => void;
  setShowResultDialog: (show: boolean) => void;
  setScoreSubmitted: (submitted: boolean) => void;
  setSelectedCell: (cell: undefined) => void;
  setHasChosenIcon: (chosen: boolean) => void;
}

export const useAutoContinue = ({
  shouldContinue,
  slug,
  gameType,
  navigate,
  caroGame,
  ticTacToeGame,
  snakeGame,
  match3Game,
  memoryGame,
  setShowIconSelector,
  setShowResultDialog,
  setScoreSubmitted,
  setSelectedCell,
  setHasChosenIcon,
}: UseAutoContinueProps) => {
  // Auto-continue for Caro
  useEffect(() => {
    const tryContinue = async () => {
      if (!shouldContinue || gameType !== 'caro' || !slug) return;

      try {
        const items = await listGameSaves(slug);
        if (!items || items.length === 0) {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        const latest = items[0];
        const state = (await loadGameSave(slug, latest.id)) as CaroGameState;

        if (state.gameStatus !== 'playing') {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        caroGame.restoreState(state);
        setShowIconSelector(false);
        setShowResultDialog(false);
        setScoreSubmitted(false);
        setSelectedCell(undefined);
      } catch {
        navigate(`/game/${slug}`, { replace: true });
      }
    };

    void tryContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldContinue, gameType, slug]);

  // Auto-continue for Tic-Tac-Toe
  useEffect(() => {
    const tryContinueTicTacToe = async () => {
      if (!shouldContinue || gameType !== 'tic-tac-toe' || !slug) return;

      try {
        const items = await listGameSaves(slug);
        if (!items || items.length === 0) {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        const latest = items[0];
        const state = (await loadGameSave(slug, latest.id)) as TicTacToeGameState;

        if (state.status !== 'playing') {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        ticTacToeGame.restoreState(state);
        setShowIconSelector(false);
        setShowResultDialog(false);
        setScoreSubmitted(false);
        setSelectedCell(undefined);
        setHasChosenIcon(true);
      } catch {
        navigate(`/game/${slug}`, { replace: true });
      }
    };

    void tryContinueTicTacToe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldContinue, gameType, slug]);

  // Auto-continue for Snake
  useEffect(() => {
    const tryContinueSnake = async () => {
      if (!shouldContinue || gameType !== 'snake' || !slug) return;

      try {
        const items = await listGameSaves(slug);
        if (!items || items.length === 0) {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        const latest = items[0];
        const state = (await loadGameSave(slug, latest.id)) as SnakeGameState;

        if (state.gameStatus !== 'playing') {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        snakeGame.restoreState(state);
        setShowResultDialog(false);
        setScoreSubmitted(false);
        setSelectedCell(undefined);
      } catch {
        navigate(`/game/${slug}`, { replace: true });
      }
    };

    void tryContinueSnake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldContinue, gameType, slug]);

  // Auto-continue for Match 3
  useEffect(() => {
    const tryContinueMatch3 = async () => {
      if (!shouldContinue || gameType !== 'match-3' || !slug) return;

      try {
        const items = await listGameSaves(slug);
        if (!items || items.length === 0) {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        const latest = items[0];
        const loadedState = await loadGameSave(slug, latest.id);
        const state = loadedState as unknown as Match3GameState;

        if (state.gameStatus !== 'playing') {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        match3Game.restoreState(state);
        setShowResultDialog(false);
        setScoreSubmitted(false);
        setSelectedCell(undefined);
      } catch {
        navigate(`/game/${slug}`, { replace: true });
      }
    };

    void tryContinueMatch3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldContinue, gameType, slug]);

  // Auto-continue for Memory
  useEffect(() => {
    const tryContinueMemory = async () => {
      if (!shouldContinue || gameType !== 'memory' || !slug) return;

      try {
        const items = await listGameSaves(slug);
        if (!items || items.length === 0) {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        const latest = items[0];
        const loadedState = await loadGameSave(slug, latest.id);
        const state = loadedState as unknown as MemoryGameState;

        if (state.gameStatus !== 'playing') {
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        memoryGame.restoreState(state);
        setShowResultDialog(false);
        setScoreSubmitted(false);
        setSelectedCell(undefined);
      } catch {
        navigate(`/game/${slug}`, { replace: true });
      }
    };

    void tryContinueMemory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldContinue, gameType, slug]);
};
