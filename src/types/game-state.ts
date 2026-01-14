/**
 * Game state types for caro and other games
 */

export type Player = 'player' | 'computer';

export type GameStatus = 'playing' | 'player-won' | 'computer-won' | 'draw';

export interface Move {
  row: number;
  col: number;
  player: Player;
}

export interface CaroGameState {
  board: (Player | null)[][];
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player | null;
  moves: number;
  lastMove: Move | null;
}
