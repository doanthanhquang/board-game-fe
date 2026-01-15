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

export type SnakeDirection = 'up' | 'down' | 'left' | 'right';

export type SnakeGameStatus = 'playing' | 'paused' | 'game-over';

export interface SnakePosition {
  row: number;
  col: number;
}

export interface SnakeGameState {
  snake: SnakePosition[];
  food: SnakePosition;
  direction: SnakeDirection;
  nextDirection: SnakeDirection | null;
  score: number;
  gameStatus: SnakeGameStatus;
  boardWidth: number;
  boardHeight: number;
}

export type Match3GameStatus = 'playing' | 'time-up' | 'no-moves' | 'game-over';

export type TileColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

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
