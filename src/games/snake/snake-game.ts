import type { SnakeDirection, SnakeGameState, SnakePosition } from '@/types/game-state';

const INITIAL_SNAKE_LENGTH = 3;
const SCORE_PER_FOOD = 10;

const directionDeltas: Record<SnakeDirection, { row: number; col: number }> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

const createInitialSnake = (width: number, height: number): SnakePosition[] => {
  const centerRow = Math.max(0, Math.floor(height / 2));
  const centerCol = Math.max(0, Math.floor(width / 2));

  const snake: SnakePosition[] = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    const col = centerCol - i;
    if (col >= 0) {
      snake.push({ row: centerRow, col });
    }
  }

  if (snake.length === 0) {
    // Fallback for tiny boards
    snake.push({ row: centerRow, col: centerCol });
  }

  return snake;
};

const positionsToSet = (snake: SnakePosition[]): Set<string> => {
  const set = new Set<string>();
  snake.forEach((pos) => {
    set.add(`${pos.row},${pos.col}`);
  });
  return set;
};

const isOppositeDirection = (current: SnakeDirection, next: SnakeDirection): boolean => {
  return (
    (current === 'up' && next === 'down') ||
    (current === 'down' && next === 'up') ||
    (current === 'left' && next === 'right') ||
    (current === 'right' && next === 'left')
  );
};

const getNextHeadPosition = (head: SnakePosition, direction: SnakeDirection): SnakePosition => {
  const delta = directionDeltas[direction];
  return {
    row: head.row + delta.row,
    col: head.col + delta.col,
  };
};

const generateFoodPosition = (
  width: number,
  height: number,
  snake: SnakePosition[]
): SnakePosition => {
  const occupied = positionsToSet(snake);
  const available: SnakePosition[] = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const key = `${row},${col}`;
      if (!occupied.has(key)) {
        available.push({ row, col });
      }
    }
  }

  if (available.length === 0) {
    // Board is full (rare). Keep food on the head so game ends naturally.
    return snake[0];
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

export const initializeSnakeGame = (width: number, height: number): SnakeGameState => {
  const snake = createInitialSnake(width, height);
  const food = generateFoodPosition(width, height, snake);

  return {
    snake,
    food,
    direction: 'right',
    nextDirection: null,
    score: 0,
    gameStatus: 'playing',
    boardWidth: width,
    boardHeight: height,
  };
};

export const moveSnake = (state: SnakeGameState): SnakeGameState => {
  if (state.gameStatus !== 'playing') {
    return state;
  }

  const resolvedDirection =
    state.nextDirection && !isOppositeDirection(state.direction, state.nextDirection)
      ? state.nextDirection
      : state.direction;

  const head = state.snake[0];
  const newHead = getNextHeadPosition(head, resolvedDirection);

  const hitsWall =
    newHead.row < 0 ||
    newHead.row >= state.boardHeight ||
    newHead.col < 0 ||
    newHead.col >= state.boardWidth;

  const hitsSelf = state.snake.some(
    (segment) => segment.row === newHead.row && segment.col === newHead.col
  );

  if (hitsWall || hitsSelf) {
    return {
      ...state,
      direction: resolvedDirection,
      nextDirection: null,
      gameStatus: 'game-over',
    };
  }

  const eatsFood = newHead.row === state.food.row && newHead.col === state.food.col;

  const newSnake = eatsFood
    ? [newHead, ...state.snake]
    : [newHead, ...state.snake.slice(0, state.snake.length - 1)];

  const newScore = eatsFood ? state.score + SCORE_PER_FOOD : state.score;
  const newFood = eatsFood
    ? generateFoodPosition(state.boardWidth, state.boardHeight, newSnake)
    : state.food;

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction: resolvedDirection,
    nextDirection: null,
    score: newScore,
  };
};

export const resetSnakeGame = (width: number, height: number): SnakeGameState => {
  return initializeSnakeGame(width, height);
};

export const canChangeDirection = (current: SnakeDirection, next: SnakeDirection): boolean => {
  return !isOppositeDirection(current, next);
};
