/**
 * Game type detection utilities
 */

import type { Game } from '@/api/games';

export type GameType =
  | 'caro'
  | 'tic-tac-toe'
  | 'snake'
  | 'match-3'
  | 'memory'
  | 'free-draw'
  | 'unknown';

export const detectGameType = (game: Game | null): GameType => {
  if (!game) return 'unknown';

  if (game.slug === 'caro-4' || game.slug === 'caro-5') return 'caro';
  if (game.slug === 'tic-tac-toe') return 'tic-tac-toe';
  if (game.slug === 'snake') return 'snake';
  if (game.slug === 'match-3') return 'match-3';
  if (game.slug === 'memory-game') return 'memory';
  if (game.slug === 'free-draw' || game.game_type === 'drawing') return 'free-draw';

  return 'unknown';
};

export const getTargetInRow = (game: Game | null): number => {
  return game?.slug === 'caro-5' ? 5 : 4;
};
