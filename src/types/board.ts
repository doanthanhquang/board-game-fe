export interface BoardCell {
  row: number;
  col: number;
  color: string | null; // null = default/uncolored
  selected?: boolean;
  disabled?: boolean;
  isLastMove?: boolean; // Highlight last move with thicker border
  movePlayer?: 'player' | 'computer'; // Which player made the move at this cell
  icon?: 'X' | 'O' | null; // Icon for caro game (X or O)
}

/**
 * Represents the state of the game board
 */
export interface BoardState {
  cells: BoardCell[][];
  width: number;
  height: number;
  selectedCell?: { row: number; col: number };
}

/**
 * Function button action callback type
 */
export type FunctionButtonAction = () => void;

/**
 * Props for the GameBoard component
 */
export interface GameBoardProps {
  width: number;
  height: number;
  cells: BoardCell[][];
  selectedCell?: { row: number; col: number };
  onCellClick?: (row: number, col: number) => void;
  disabled?: boolean;
}

/**
 * Props for the FunctionButtons component
 */
export interface FunctionButtonsProps {
  onLeft?: FunctionButtonAction;
  onRight?: FunctionButtonAction;
  onUp?: FunctionButtonAction;
  onDown?: FunctionButtonAction;
  onEnter?: FunctionButtonAction;
  onBack?: FunctionButtonAction;
  onHint?: FunctionButtonAction;
  disabled?: {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
    enter?: boolean;
    back?: boolean;
    hint?: boolean;
  };
}
