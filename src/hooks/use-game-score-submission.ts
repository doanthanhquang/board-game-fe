/**
 * Hook for game score submission and save clearing
 */

import { useEffect } from 'react';
import { recordGameScore, clearGameSaves } from '@/api/games';
import type { GameType } from '@/types/game-types';
import type {
  CaroGameState,
  SnakeGameState,
  Match3GameState,
  MemoryGameState,
} from '@/types/game-state';
import type { TicTacToeGameState } from '@/games/tic-tac-toe/tic-tac-toe-game';

interface GameHookWithState<T> {
  gameState: T | null;
}

interface UseGameScoreSubmissionProps {
  slug: string | undefined;
  gameType: GameType;
  scoreSubmitted: boolean;
  setScoreSubmitted: (submitted: boolean) => void;
  caroGame: GameHookWithState<CaroGameState>;
  ticTacToeGame: GameHookWithState<TicTacToeGameState>;
  snakeGame: GameHookWithState<SnakeGameState>;
  match3Game: GameHookWithState<Match3GameState>;
  memoryGame: GameHookWithState<MemoryGameState>;
  playerIcon: 'X' | 'O';
}

export const useGameScoreSubmission = ({
  slug,
  gameType,
  scoreSubmitted,
  setScoreSubmitted,
  caroGame,
  ticTacToeGame,
  snakeGame,
  match3Game,
  memoryGame,
  playerIcon,
}: UseGameScoreSubmissionProps) => {
  // Submit score when Caro player wins
  useEffect(() => {
    if (
      gameType !== 'caro' ||
      !slug ||
      !caroGame.gameState ||
      scoreSubmitted ||
      caroGame.gameState.gameStatus !== 'player-won'
    ) {
      return;
    }

    const board = caroGame.gameState.board;
    let movesCount = 0;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 'player') {
          movesCount++;
        }
      }
    }

    if (movesCount > 0) {
      recordGameScore(slug, { movesCount, result: 'player-won' }).catch(() => {
        // Ignore score errors in UI
      });
      clearGameSaves(slug).catch(() => {
        // Ignore clear errors in UI
      });
      setScoreSubmitted(true);
    }
  }, [gameType, slug, caroGame.gameState, scoreSubmitted, setScoreSubmitted]);

  // Clear saves when Caro computer wins
  useEffect(() => {
    if (gameType !== 'caro' || !slug || !caroGame.gameState) return;
    if (caroGame.gameState.gameStatus !== 'computer-won') return;

    clearGameSaves(slug).catch(() => {
      // Ignore clear errors in UI
    });
  }, [gameType, slug, caroGame.gameState]);

  // Record score for Tic-Tac-Toe when player wins
  useEffect(() => {
    if (gameType !== 'tic-tac-toe' || !slug || !ticTacToeGame.gameState || scoreSubmitted) {
      return;
    }

    const status = ticTacToeGame.gameState.status;
    const playerWon =
      (status === 'x-won' && playerIcon === 'X') || (status === 'o-won' && playerIcon === 'O');

    if (!playerWon) return;

    const movesCount = ticTacToeGame.gameState.moves || 1;

    recordGameScore(slug, { movesCount, result: 'win' }).catch(() => {
      // Ignore score errors in UI
    });

    clearGameSaves(slug).catch(() => {
      // Ignore clear errors in UI
    });

    setScoreSubmitted(true);
  }, [gameType, slug, ticTacToeGame.gameState, scoreSubmitted, playerIcon, setScoreSubmitted]);

  // Clear saves when Tic-Tac-Toe game ends (computer win or draw)
  useEffect(() => {
    if (gameType !== 'tic-tac-toe' || !slug || !ticTacToeGame.gameState) return;
    const status = ticTacToeGame.gameState.status;
    if (
      status === 'draw' ||
      (status === 'x-won' && playerIcon === 'O') ||
      (status === 'o-won' && playerIcon === 'X')
    ) {
      clearGameSaves(slug).catch(() => {
        // Ignore clear errors in UI
      });
    }
  }, [gameType, slug, ticTacToeGame.gameState, playerIcon]);

  // Record score and clear saves when Snake game ends
  useEffect(() => {
    if (gameType !== 'snake' || !slug || !snakeGame.gameState || scoreSubmitted) return;
    if (snakeGame.gameState.gameStatus !== 'game-over') return;

    const finalScore = snakeGame.gameState.score;
    if (finalScore > 0) {
      recordGameScore(slug, { movesCount: finalScore, result: 'win' }).catch(() => {
        // Ignore score errors in UI
      });
    }

    clearGameSaves(slug).catch(() => {
      // Ignore clear errors in UI
    });

    setScoreSubmitted(true);
  }, [gameType, slug, snakeGame.gameState, scoreSubmitted, setScoreSubmitted]);

  // Record score and clear saves when Match 3 game ends
  useEffect(() => {
    if (gameType !== 'match-3' || !slug || !match3Game.gameState || scoreSubmitted) return;
    const status = match3Game.gameState.gameStatus;
    if (status !== 'time-up' && status !== 'no-moves' && status !== 'game-over') return;

    const finalScore = match3Game.gameState.score;
    if (finalScore > 0) {
      recordGameScore(slug, { movesCount: finalScore, result: 'win' }).catch(() => {
        // Ignore score errors in UI
      });
    }

    clearGameSaves(slug).catch(() => {
      // Ignore clear errors in UI
    });

    setScoreSubmitted(true);
  }, [gameType, slug, match3Game.gameState, scoreSubmitted, setScoreSubmitted]);

  // Record score and clear saves when Memory game ends
  useEffect(() => {
    if (gameType !== 'memory' || !slug || !memoryGame.gameState || scoreSubmitted) return;
    const status = memoryGame.gameState.gameStatus;
    if (status !== 'completed' && status !== 'time-up') return;

    const finalScore = memoryGame.gameState.score;
    if (finalScore > 0) {
      recordGameScore(slug, { movesCount: finalScore, result: 'win' }).catch(() => {
        // Ignore score errors in UI
      });
    }

    clearGameSaves(slug).catch(() => {
      // Ignore clear errors in UI
    });

    setScoreSubmitted(true);
  }, [gameType, slug, memoryGame.gameState, scoreSubmitted, setScoreSubmitted]);
};
