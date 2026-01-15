export interface BoardCell {
  row: number;
  col: number;
  color: string | null; // null = default/uncolored
  selected?: boolean;
  disabled?: boolean;
  isLastMove?: boolean; // Highlight last move with thicker border
  movePlayer?: 'player' | 'computer'; // Which player made the move at this cell
  icon?: 'X' | 'O' | null; // Icon for caro game (X or O)
  isFood?: boolean; // Mark food cell for Snake game
  // Animation properties for Match 3
  isSwapping?: boolean; // Tile is being swapped
  isFalling?: boolean; // Tile is falling down
  fallFromRow?: number; // Original row before falling
  isMatched?: boolean; // Tile is part of a match (will be removed)
  isDragging?: boolean; // Tile is being dragged
  isKeyboardPosition?: boolean; // Tile is at keyboard navigation position
  // Properties for Memory Card game
  isFlipped?: boolean; // Card is face-up (flipped)
  isRemoved?: boolean; // Card has been removed (matched)
  cardValue?: number | null; // Card value (shown when flipped)
  cardColor?: string | null; // Card's actual color (based on value, doesn't change when flipped)
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
  onCellDragStart?: (row: number, col: number) => void;
  onCellDragEnd?: (row: number, col: number) => void;
  onCellDragOver?: (row: number, col: number) => void;
  onCellDrop?: (row: number, col: number) => void;
  disabled?: boolean;
  cellSizeMultiplier?: number; // Multiplier for cell size (default: 1, use < 1 for smaller cells)
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
