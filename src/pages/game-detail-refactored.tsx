import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpIcon from '@mui/icons-material/Help';
import { getGameBySlug, type Game, saveGameState } from '@/api/games';
import { GameBoard, FunctionButtons } from '@/components/game-board';
import { GameResultDialog, GameInstructionsDialog, GameIconSelectorDialog } from '@/components';
import { SavedDrawingsList } from '@/components/saved-drawings-list/saved-drawings-list';
import {
  CaroGameControls,
  TicTacToeGameControls,
  SnakeGameControls,
  Match3MemoryGameControls,
  FreeDrawGameControls,
} from '@/components/game-controls';
import { useCaroGame } from '@/hooks/use-caro-game';
import { useTicTacToeGame } from '@/hooks/use-tic-tac-toe-game';
import { useSnakeGame } from '@/hooks/use-snake-game';
import { useMatch3Game } from '@/hooks/use-match-3-game';
import { useMemoryGame } from '@/hooks/use-memory-game';
import { useFreeDrawGame } from '@/hooks/use-free-draw-game';
import { useGameBoardCells } from '@/hooks/use-game-board-cells';
import { useGameButtonHandlers } from '@/hooks/use-game-button-handlers';
import { detectGameType, getTargetInRow } from '@/types/game-types';
import { createCellClickHandler } from '@/utils/cell-click-handler';
import { calculateCaroPlayerScore } from '@/utils/score-calculator';
import { useAutoContinue } from '@/hooks/use-auto-continue';
import { useGameScoreSubmission } from '@/hooks/use-game-score-submission';

export const GameDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [playerIcon, setPlayerIcon] = useState<'X' | 'O'>('X');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | undefined>(
    undefined
  );
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveToastOpen, setSaveToastOpen] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState<string | null>(null);
  const [saveToastSeverity, setSaveToastSeverity] = useState<'success' | 'error'>('success');
  const [hasChosenIcon, setHasChosenIcon] = useState(false);
  const [showSavedDrawings, setShowSavedDrawings] = useState(false);
  const gameBoardRef = useRef<HTMLDivElement>(null);

  const gameType = detectGameType(game);
  const targetInRow = getTargetInRow(game);
  const shouldContinue = searchParams.get('continue') === '1';

  // Initialize game hooks
  const caroGame = useCaroGame({
    width: game?.default_board_width || 0,
    height: game?.default_board_height || 0,
    enabled: gameType === 'caro' && !showIconSelector,
    playerIcon: playerIcon,
    targetInRow: targetInRow,
  });

  const ticTacToeGame = useTicTacToeGame({
    enabled: Boolean(gameType === 'tic-tac-toe' && !showIconSelector),
    playerIcon,
  });

  const snakeGame = useSnakeGame({
    width: game?.default_board_width || 0,
    height: game?.default_board_height || 0,
    enabled: Boolean(gameType === 'snake'),
    speedMs: 180,
  });

  const match3Game = useMatch3Game({
    width: game?.default_board_width || 0,
    height: game?.default_board_height || 0,
    enabled: Boolean(gameType === 'match-3'),
    timeLimit: game?.default_time_limit || 300,
  });

  const memoryGame = useMemoryGame({
    width: game?.default_board_width || 0,
    height: game?.default_board_height || 0,
    enabled: Boolean(gameType === 'memory'),
    timeLimit: game?.default_time_limit || 300,
  });

  const freeDrawGame = useFreeDrawGame({
    width: game?.default_board_width || 0,
    height: game?.default_board_height || 0,
    enabled: Boolean(gameType === 'free-draw'),
  });

  // Calculate scores
  const playerScore = useMemo(
    () => calculateCaroPlayerScore(caroGame.gameState),
    [caroGame.gameState]
  );
  const snakeScore = snakeGame.gameState?.score ?? 0;

  // Use custom hook for auto-continue logic
  useAutoContinue({
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
  });

  // Use custom hook for score submission
  useGameScoreSubmission({
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
  });

  // Board cells with selection
  const boardCells = useGameBoardCells({
    game,
    gameType,
    selectedCell,
    caroBoardCells: caroGame.boardCells,
    ticTacToeBoardCells: ticTacToeGame.boardCells,
    snakeBoardCells: snakeGame.boardCells,
    match3BoardCells: match3Game.boardCells,
    memoryBoardCells: memoryGame.boardCells,
    freeDrawBoardCells: freeDrawGame.boardCells,
  });

  // Show icon selector when starting games
  useEffect(() => {
    if (
      gameType === 'caro' &&
      game &&
      !showIconSelector &&
      !caroGame.gameState &&
      !shouldContinue &&
      !hasChosenIcon
    ) {
      setShowIconSelector(true);
    }
  }, [gameType, game, showIconSelector, caroGame.gameState, shouldContinue, hasChosenIcon]);

  useEffect(() => {
    if (
      gameType === 'tic-tac-toe' &&
      game &&
      !showIconSelector &&
      !ticTacToeGame.gameState &&
      !shouldContinue &&
      !hasChosenIcon
    ) {
      setShowIconSelector(true);
    }
  }, [gameType, game, showIconSelector, ticTacToeGame.gameState, shouldContinue, hasChosenIcon]);

  // Clear selection for games that don't use it
  useEffect(() => {
    if (gameType === 'snake' || gameType === 'match-3') {
      setSelectedCell(undefined);
    }
  }, [gameType]);

  // Show result dialogs when games end
  useEffect(() => {
    if (gameType === 'caro' && caroGame.isGameEnded && caroGame.gameState) {
      setShowResultDialog(true);
    }
  }, [gameType, caroGame.isGameEnded, caroGame.gameState]);

  useEffect(() => {
    if (gameType === 'tic-tac-toe' && ticTacToeGame.isGameEnded && ticTacToeGame.gameState) {
      setShowResultDialog(true);
    }
  }, [gameType, ticTacToeGame.isGameEnded, ticTacToeGame.gameState]);

  useEffect(() => {
    if (gameType === 'snake' && snakeGame.isGameOver && snakeGame.gameState) {
      setShowResultDialog(true);
    }
  }, [gameType, snakeGame.isGameOver, snakeGame.gameState]);

  useEffect(() => {
    if (gameType === 'match-3' && match3Game.isGameEnded && match3Game.gameState) {
      setShowResultDialog(true);
    }
  }, [gameType, match3Game.isGameEnded, match3Game.gameState]);

  useEffect(() => {
    if (gameType === 'memory' && memoryGame.isGameEnded && memoryGame.gameState) {
      setShowResultDialog(true);
    }
  }, [gameType, memoryGame.isGameEnded, memoryGame.gameState]);

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      if (!slug) {
        setError('Invalid game slug');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const gameData = await getGameBySlug(slug);
        setGame(gameData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Game not found. Please try again.';
        setError(errorMessage);
        console.error('Error fetching game:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [slug]);

  // Auto-scroll to game board
  useEffect(() => {
    if (game && boardCells.length > 0 && gameBoardRef.current) {
      const timer = setTimeout(() => {
        gameBoardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [game, boardCells.length]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleToggleInstructions = useCallback(() => {
    setShowInstructions((prev) => !prev);
  }, []);

  const handleSaveGame = useCallback(async () => {
    if (!slug) return;

    const stateToSave =
      caroGame.getSerializableState() ??
      ticTacToeGame.gameState ??
      snakeGame.getSerializableState() ??
      match3Game.getSerializableState() ??
      memoryGame.getSerializableState() ??
      freeDrawGame.getSerializableState();

    if (!stateToSave) return;

    try {
      setSaving(true);
      setSaveError(null);
      await saveGameState(slug, { gameState: stateToSave });
      setSaveToastSeverity('success');
      setSaveToastMessage('Lưu ván chơi thành công!');
      setSaveToastOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu ván chơi.';
      setSaveError(message);
      setSaveToastSeverity('error');
      setSaveToastMessage(message);
      setSaveToastOpen(true);
    } finally {
      setSaving(false);
    }
  }, [slug, caroGame, ticTacToeGame, snakeGame, match3Game, memoryGame, freeDrawGame]);

  const handleNewGameFromResult = useCallback(() => {
    if (gameType === 'caro') {
      caroGame.handleReset();
      setHasChosenIcon(false);
      setShowIconSelector(true);
    } else if (gameType === 'tic-tac-toe') {
      ticTacToeGame.handleReset();
      setHasChosenIcon(false);
      setShowIconSelector(true);
    } else if (gameType === 'snake') {
      snakeGame.handleReset();
    } else if (gameType === 'match-3') {
      match3Game.handleReset();
    } else if (gameType === 'memory') {
      memoryGame.handleReset();
    } else if (gameType === 'free-draw') {
      freeDrawGame.handleClearBoard();
    }
    setSelectedCell(undefined);
    setShowResultDialog(false);
    setScoreSubmitted(false);
  }, [gameType, caroGame, ticTacToeGame, snakeGame, match3Game, memoryGame, freeDrawGame]);

  // Button handlers
  const { handleLeft, handleRight, handleUp, handleDown, handleEnter } = useGameButtonHandlers({
    game,
    gameType,
    selectedCell,
    setSelectedCell,
    showInstructions,
    showResultDialog,
    handlers: {
      caro: {
        handleCellClick: caroGame.handleCellClick,
        isGameEnded: caroGame.isGameEnded,
        isAITurn: caroGame.isAITurn,
      },
      ticTacToe: {
        handleCellClick: ticTacToeGame.handleCellClick,
        isGameEnded: ticTacToeGame.isGameEnded,
      },
      snake: {
        changeDirection: snakeGame.changeDirection,
      },
      match3: {
        handleMoveSelection: match3Game.handleMoveSelection,
        handleSwapSelected: match3Game.handleSwapSelected,
      },
      memory: {
        handleMoveSelection: memoryGame.handleMoveSelection,
        handleCardSelect: memoryGame.handleCardSelect,
      },
    },
  });

  const handleCellClick = createCellClickHandler(
    gameType,
    {
      caro: { handleCellClick: caroGame.handleCellClick },
      ticTacToe: { handleCellClick: ticTacToeGame.handleCellClick },
      match3: { handleTileClick: match3Game.handleTileClick },
      memory: { handleCardClick: memoryGame.handleCardClick },
      freeDraw: { handleCellClick: freeDrawGame.handleCellClick },
    },
    setSelectedCell
  );

  const handleBack = useCallback(() => {
    if (showInstructions) {
      handleToggleInstructions();
    } else if (showResultDialog) {
      setShowResultDialog(false);
    } else {
      handleBackToDashboard();
    }
  }, [showInstructions, showResultDialog, handleToggleInstructions, handleBackToDashboard]);

  const handleHint = useCallback(() => {
    handleToggleInstructions();
  }, [handleToggleInstructions]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !game) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ padding: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || 'Không tìm thấy trò chơi'}
            </Alert>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToDashboard}
            >
              Quay lại trang chính
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" component="h1">
              {game.name}
            </Typography>
            <IconButton
              color="primary"
              onClick={handleToggleInstructions}
              aria-label="Show game instructions"
            >
              <HelpIcon />
            </IconButton>
          </Box>

          {game.description && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              {game.description}
            </Typography>
          )}

          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            {/* Game-specific controls */}
            {gameType === 'caro' && caroGame.gameState && (
              <CaroGameControls
                statusMessage={caroGame.getStatusMessage() || ''}
                playerScore={playerScore}
                isGameEnded={caroGame.isGameEnded}
                saving={saving}
                saveError={saveError}
                onSave={handleSaveGame}
                onNewGame={handleNewGameFromResult}
                onBackToDashboard={handleBackToDashboard}
              />
            )}

            {gameType === 'tic-tac-toe' && ticTacToeGame.gameState && (
              <TicTacToeGameControls
                statusMessage={ticTacToeGame.getStatusMessage() || ''}
                isGameEnded={ticTacToeGame.isGameEnded}
                saving={saving}
                onSave={handleSaveGame}
                onReset={ticTacToeGame.handleReset}
              />
            )}

            {gameType === 'snake' && snakeGame.gameState && (
              <SnakeGameControls
                statusMessage={snakeGame.getStatusMessage() || ''}
                score={snakeScore}
                isGameOver={snakeGame.isGameOver}
                isPaused={snakeGame.isPaused}
                saving={saving}
                saveError={saveError}
                onSave={handleSaveGame}
                onPause={snakeGame.handlePause}
                onResume={snakeGame.handleResume}
                onReset={() => {
                  snakeGame.handleReset();
                  setScoreSubmitted(false);
                  setShowResultDialog(false);
                  setSelectedCell(undefined);
                }}
                onBackToDashboard={handleBackToDashboard}
              />
            )}

            {gameType === 'match-3' && match3Game.gameState && (
              <Match3MemoryGameControls
                statusMessage={match3Game.getStatusMessage() || ''}
                isGameEnded={match3Game.isGameEnded}
                saving={saving}
                saveError={saveError}
                onSave={handleSaveGame}
                onReset={() => {
                  match3Game.handleReset();
                  setScoreSubmitted(false);
                  setShowResultDialog(false);
                  setSelectedCell(undefined);
                }}
                onBackToDashboard={handleBackToDashboard}
              />
            )}

            {gameType === 'memory' && memoryGame.gameState && (
              <Match3MemoryGameControls
                statusMessage={memoryGame.getStatusMessage() || ''}
                isGameEnded={memoryGame.isGameEnded}
                saving={saving}
                saveError={saveError}
                onSave={handleSaveGame}
                onReset={() => {
                  memoryGame.handleReset();
                  setScoreSubmitted(false);
                  setShowResultDialog(false);
                  setSelectedCell(undefined);
                }}
                onBackToDashboard={handleBackToDashboard}
              />
            )}

            {gameType === 'free-draw' && freeDrawGame.gameState && (
              <FreeDrawGameControls
                selectedColor={freeDrawGame.gameState.selectedColor}
                saving={saving}
                saveError={saveError}
                onColorChange={freeDrawGame.handleColorChange}
                onSave={handleSaveGame}
                onShowDrawings={() => setShowSavedDrawings(true)}
                onClearBoard={freeDrawGame.handleClearBoard}
              />
            )}

            {/* Game Board */}
            {game && boardCells.length > 0 && (
              <>
                <Box ref={gameBoardRef}>
                  <GameBoard
                    width={game.default_board_width}
                    height={game.default_board_height}
                    cells={boardCells}
                    selectedCell={selectedCell}
                    onCellClick={handleCellClick}
                    onCellDragStart={
                      gameType === 'match-3' ? match3Game.handleTileDragStart : undefined
                    }
                    onCellDragEnd={
                      gameType === 'match-3' ? match3Game.handleTileDragEnd : undefined
                    }
                    onCellDragOver={
                      gameType === 'match-3' ? match3Game.handleTileDragOver : undefined
                    }
                    onCellDrop={gameType === 'match-3' ? match3Game.handleTileDrop : undefined}
                    disabled={
                      gameType === 'snake'
                        ? true
                        : gameType === 'match-3'
                          ? match3Game.isGameEnded
                          : gameType === 'memory'
                            ? memoryGame.isGameEnded
                            : gameType === 'free-draw'
                              ? false
                              : gameType === 'caro'
                                ? caroGame.isGameEnded ||
                                  caroGame.isAITurn ||
                                  caroGame.gameState?.currentPlayer === 'computer'
                                : gameType === 'tic-tac-toe'
                                  ? ticTacToeGame.isGameEnded ||
                                    ticTacToeGame.gameState?.currentPlayer ===
                                      (playerIcon === 'X' ? 'O' : 'X')
                                  : false
                    }
                    cellSizeMultiplier={
                      gameType === 'snake' ? 0.7 : gameType === 'match-3' ? 0.9 : 1
                    }
                  />
                </Box>

                <FunctionButtons
                  onLeft={handleLeft}
                  onRight={handleRight}
                  onUp={handleUp}
                  onDown={handleDown}
                  onEnter={handleEnter}
                  onBack={handleBack}
                  onHint={handleHint}
                  disabled={{
                    left:
                      showInstructions ||
                      showResultDialog ||
                      (gameType === 'snake' && (snakeGame.isGameOver || snakeGame.isPaused)) ||
                      (gameType === 'match-3' && match3Game.isGameEnded) ||
                      (gameType === 'memory' && memoryGame.isGameEnded),
                    right:
                      showInstructions ||
                      showResultDialog ||
                      (gameType === 'snake' && (snakeGame.isGameOver || snakeGame.isPaused)) ||
                      (gameType === 'match-3' && match3Game.isGameEnded) ||
                      (gameType === 'memory' && memoryGame.isGameEnded),
                    up:
                      showInstructions ||
                      showResultDialog ||
                      (gameType === 'snake' && (snakeGame.isGameOver || snakeGame.isPaused)) ||
                      (gameType === 'match-3' && match3Game.isGameEnded) ||
                      (gameType === 'memory' && memoryGame.isGameEnded),
                    down:
                      showInstructions ||
                      showResultDialog ||
                      (gameType === 'snake' && (snakeGame.isGameOver || snakeGame.isPaused)) ||
                      (gameType === 'match-3' && match3Game.isGameEnded) ||
                      (gameType === 'memory' && memoryGame.isGameEnded),
                    enter:
                      showInstructions ||
                      showResultDialog ||
                      (gameType === 'match-3' && match3Game.isGameEnded) ||
                      (gameType === 'memory' && memoryGame.isGameEnded) ||
                      (gameType === 'caro' && (caroGame.isGameEnded || caroGame.isAITurn)) ||
                      (gameType === 'tic-tac-toe' &&
                        (ticTacToeGame.isGameEnded ||
                          ticTacToeGame.gameState?.currentPlayer ===
                            (playerIcon === 'X' ? 'O' : 'X'))),
                    back: false,
                    hint: showResultDialog,
                  }}
                />
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Dialogs */}
      <GameInstructionsDialog
        open={showInstructions}
        instructions={game.instructions}
        onClose={handleToggleInstructions}
      />

      {(gameType === 'caro' || gameType === 'tic-tac-toe') && (
        <GameIconSelectorDialog
          open={showIconSelector}
          playerIcon={playerIcon}
          onChangePlayerIcon={(icon: 'X' | 'O') => setPlayerIcon(icon)}
          onStart={() => {
            setHasChosenIcon(true);
            setShowIconSelector(false);
          }}
        />
      )}

      {/* Game Result Dialogs */}
      {gameType === 'caro' && caroGame.gameState && (
        <GameResultDialog
          open={showResultDialog}
          gameStatus={caroGame.gameState.gameStatus}
          onClose={() => setShowResultDialog(false)}
          onNewGame={handleNewGameFromResult}
          gameName={game.name}
          score={playerScore}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {gameType === 'tic-tac-toe' && ticTacToeGame.gameState && (
        <GameResultDialog
          open={showResultDialog}
          gameStatus={
            ticTacToeGame.gameState.status === 'draw'
              ? 'draw'
              : ticTacToeGame.gameState.status === 'playing'
                ? 'playing'
                : (ticTacToeGame.gameState.status === 'x-won' && playerIcon === 'X') ||
                    (ticTacToeGame.gameState.status === 'o-won' && playerIcon === 'O')
                  ? 'player-won'
                  : 'computer-won'
          }
          onClose={() => setShowResultDialog(false)}
          onNewGame={handleNewGameFromResult}
          gameName={game.name}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {gameType === 'snake' && snakeGame.gameState && (
        <GameResultDialog
          open={showResultDialog}
          gameStatus={snakeGame.gameState.gameStatus === 'game-over' ? 'game-over' : 'playing'}
          onClose={() => setShowResultDialog(false)}
          onNewGame={handleNewGameFromResult}
          gameName={game.name}
          score={snakeScore}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {gameType === 'match-3' && match3Game.gameState && (
        <GameResultDialog
          open={showResultDialog}
          gameStatus={match3Game.gameState.gameStatus}
          onClose={() => setShowResultDialog(false)}
          onNewGame={handleNewGameFromResult}
          gameName={game.name}
          score={match3Game.gameState.score}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {gameType === 'memory' && memoryGame.gameState && (
        <GameResultDialog
          open={showResultDialog}
          gameStatus={memoryGame.gameState.gameStatus}
          onClose={() => setShowResultDialog(false)}
          onNewGame={handleNewGameFromResult}
          gameName={game.name}
          score={memoryGame.gameState.score}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {gameType === 'free-draw' && slug && (
        <SavedDrawingsList
          open={showSavedDrawings}
          onClose={() => setShowSavedDrawings(false)}
          gameSlug={slug}
          onLoad={(state) => {
            freeDrawGame.restoreState(state);
            setShowSavedDrawings(false);
          }}
        />
      )}

      {/* Toast */}
      {saveToastMessage && (
        <Snackbar
          open={saveToastOpen}
          autoHideDuration={3000}
          onClose={(_, reason) => {
            if (reason === 'clickaway') return;
            setSaveToastOpen(false);
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSaveToastOpen(false)}
            severity={saveToastSeverity}
            sx={{ width: '100%' }}
          >
            {saveToastMessage}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};
