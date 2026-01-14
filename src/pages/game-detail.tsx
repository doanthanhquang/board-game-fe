import { useState, useEffect, useMemo } from 'react';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import {
  getGameBySlug,
  type Game,
  recordGameScore,
  saveGameState,
  listGameSaves,
  loadGameSave,
  clearGameSaves,
} from '@/api/games';
import { GameBoard, FunctionButtons } from '@/components/game-board';
import { GameResultDialog, GameInstructionsDialog, GameIconSelectorDialog } from '@/components';
import type { BoardCell } from '@/types/board';
import { useCaroGame } from '@/hooks/use-caro-game';
import { useTicTacToeGame } from '@/hooks/use-tic-tac-toe-game';
import type { CaroGameState } from '@/types/game-state';
import type { TicTacToeGameState } from '@/games/tic-tac-toe/tic-tac-toe-game';

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
  const isCaroGame = game?.slug === 'caro-4' || game?.slug === 'caro-5';
  const isTicTacToeGame = game?.slug === 'tic-tac-toe';
  const targetInRow = game?.slug === 'caro-5' ? 5 : 4;
  const shouldContinue = searchParams.get('continue') === '1';

  // Use caro game hook
  const caroGame = useCaroGame({
    width: game?.default_board_width || 0,
    height: game?.default_board_height || 0,
    enabled: isCaroGame && !showIconSelector,
    playerIcon: playerIcon,
    targetInRow: targetInRow,
  });

  // Tic-Tac-Toe game hook (3x3, player vs computer with X/O selection)
  const ticTacToeGame = useTicTacToeGame({
    enabled: Boolean(isTicTacToeGame && !showIconSelector),
    playerIcon,
  });

  // Live player score (number of player moves in current game)
  const playerScore = useMemo(() => {
    if (!isCaroGame || !caroGame.gameState) return 0;

    const board = caroGame.gameState.board;
    let movesCount = 0;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 'player') {
          movesCount++;
        }
      }
    }
    return movesCount;
  }, [isCaroGame, caroGame.gameState]);

  // Show icon selector when starting a NEW caro game (not when continuing)
  useEffect(() => {
    if (
      isCaroGame &&
      game &&
      !showIconSelector &&
      !caroGame.gameState &&
      !shouldContinue &&
      !hasChosenIcon
    ) {
      setShowIconSelector(true);
    }
  }, [isCaroGame, game, showIconSelector, caroGame.gameState, shouldContinue, hasChosenIcon]);

  // Show icon selector when starting Tic-Tac-Toe game
  useEffect(() => {
    if (
      isTicTacToeGame &&
      game &&
      !showIconSelector &&
      !ticTacToeGame.gameState &&
      !shouldContinue &&
      !hasChosenIcon
    ) {
      setShowIconSelector(true);
    }
  }, [
    isTicTacToeGame,
    game,
    showIconSelector,
    ticTacToeGame.gameState,
    shouldContinue,
    hasChosenIcon,
  ]);

  // Submit score when player wins (Caro only) and clear saves for finished game
  useEffect(() => {
    if (
      !isCaroGame ||
      !game ||
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

    if (movesCount > 0 && slug) {
      recordGameScore(slug, { movesCount, result: 'player-won' }).catch(() => {
        // Ignore score errors in UI
      });
      // Clear any saves related to this game so user cannot continue a finished match
      clearGameSaves(slug).catch(() => {
        // Ignore clear errors in UI
      });
      setScoreSubmitted(true);
    }
  }, [isCaroGame, game, caroGame.gameState, scoreSubmitted, slug, caroGame]);

  // When game ends with computer win, also clear saves so user cannot continue
  useEffect(() => {
    if (!isCaroGame || !slug || !caroGame.gameState) return;
    if (caroGame.gameState.gameStatus !== 'computer-won') return;

    clearGameSaves(slug).catch(() => {
      // Ignore clear errors in UI
    });
  }, [isCaroGame, slug, caroGame.gameState]);

  // Reset for new game from result dialog
  const handleNewGameFromResult = () => {
    caroGame.handleReset();
    setSelectedCell(undefined);
    setShowResultDialog(false);
    setScoreSubmitted(false);
    if (isCaroGame || isTicTacToeGame) {
      setHasChosenIcon(false);
      setShowIconSelector(true);
    }
  };

  // Initialize board cells from game configuration
  const boardCells = useMemo<BoardCell[][]>(() => {
    if (!game) return [];

    // Tic-Tac-Toe game uses its own board cells
    if (isTicTacToeGame && ticTacToeGame.boardCells.length > 0) {
      return ticTacToeGame.boardCells.map((row, rowIndex) =>
        row.map((cell, colIndex) => ({
          ...cell,
          selected:
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? true : cell.selected,
        }))
      );
    }

    // If caro game, use cells from hook and add selection state
    if (isCaroGame) {
      return caroGame.boardCells.map((row, rowIndex) =>
        row.map((cell, colIndex) => ({
          ...cell,
          selected:
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? true : cell.selected,
        }))
      );
    }

    // For other games, create empty cells
    const cells: BoardCell[][] = [];
    for (let row = 0; row < game.default_board_height; row++) {
      cells[row] = [];
      for (let col = 0; col < game.default_board_width; col++) {
        cells[row][col] = {
          row,
          col,
          color: null,
          selected: selectedCell?.row === row && selectedCell?.col === col,
          disabled: false,
        };
      }
    }
    return cells;
  }, [
    game,
    isCaroGame,
    isTicTacToeGame,
    caroGame.boardCells,
    ticTacToeGame.boardCells,
    selectedCell,
  ]);

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

  // Auto-continue from latest saved game when requested via query param
  useEffect(() => {
    const tryContinue = async () => {
      if (!shouldContinue || !isCaroGame || !slug) return;

      try {
        const items = await listGameSaves(slug);
        if (!items || items.length === 0) {
          // No saves → clear continue flag by re-navigating without query
          navigate(`/game/${slug}`, { replace: true });
          return;
        }

        const latest = items[0];
        const state = (await loadGameSave(slug, latest.id)) as CaroGameState;

        // Only allow continue when game is still in progress
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
        // On error, fall back to fresh game
        navigate(`/game/${slug}`, { replace: true });
      }
    };

    void tryContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldContinue, isCaroGame, slug]);

  // Auto-continue from latest saved game for Tic-Tac-Toe
  useEffect(() => {
    const tryContinueTicTacToe = async () => {
      if (!shouldContinue || !isTicTacToeGame || !slug) return;

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
  }, [shouldContinue, isTicTacToeGame, slug]);

  // Show result dialog when Caro game ends
  useEffect(() => {
    if (isCaroGame && caroGame.isGameEnded && caroGame.gameState) {
      setShowResultDialog(true);
    }
  }, [isCaroGame, caroGame.isGameEnded, caroGame.gameState]);

  // Show result dialog when Tic-Tac-Toe game ends
  useEffect(() => {
    if (isTicTacToeGame && ticTacToeGame.isGameEnded && ticTacToeGame.gameState) {
      setShowResultDialog(true);
    }
  }, [isTicTacToeGame, ticTacToeGame.isGameEnded, ticTacToeGame.gameState]);

  // Record score for Tic-Tac-Toe when player wins (ranking by number of wins)
  useEffect(() => {
    if (!isTicTacToeGame || !game || !ticTacToeGame.gameState || scoreSubmitted || !slug) {
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

    // Clear saves when player wins so user cannot continue a finished match
    clearGameSaves(slug).catch(() => {
      // Ignore clear errors in UI
    });

    setScoreSubmitted(true);
  }, [isTicTacToeGame, game, ticTacToeGame.gameState, scoreSubmitted, slug, playerIcon]);

  // Clear saves when Tic-Tac-Toe game ends (computer win or draw)
  useEffect(() => {
    if (!isTicTacToeGame || !slug || !ticTacToeGame.gameState) return;
    const status = ticTacToeGame.gameState.status;
    // Clear saves when computer wins or draw (player win is handled above)
    if (
      status === 'draw' ||
      (status === 'x-won' && playerIcon === 'O') ||
      (status === 'o-won' && playerIcon === 'X')
    ) {
      clearGameSaves(slug).catch(() => {
        // Ignore clear errors in UI
      });
    }
  }, [isTicTacToeGame, slug, ticTacToeGame.gameState, playerIcon]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleToggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const handleSaveGame = async () => {
    if (!slug) return;
    // Save Caro or Tic-Tac-Toe state depending on current game
    const caroState = isCaroGame ? caroGame.getSerializableState() : null;
    const tttState = isTicTacToeGame ? ticTacToeGame.gameState : null;
    const stateToSave = caroState ?? tttState;
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
  };

  // Board cell click handler
  const handleCellClick = (row: number, col: number) => {
    if (isCaroGame) {
      caroGame.handleCellClick(row, col);
      setSelectedCell(undefined); // Clear selection after move
    } else if (isTicTacToeGame) {
      ticTacToeGame.handleCellClick(row, col);
      setSelectedCell(undefined);
    } else {
      setSelectedCell({ row, col });
    }
  };

  // Function button handlers
  const handleLeft = () => {
    if (showInstructions || showResultDialog) return;

    if (isCaroGame) {
      // For Caro game, navigate selected cell left
      if (selectedCell && game) {
        const newCol = Math.max(0, selectedCell.col - 1);
        setSelectedCell({ ...selectedCell, col: newCol });
      } else if (game && !caroGame.isGameEnded && !caroGame.isAITurn) {
        // Start selection at first cell if no selection
        setSelectedCell({ row: 0, col: 0 });
      }
    } else {
      // For other games, navigate selected cell left
      if (selectedCell && game) {
        const newCol = Math.max(0, selectedCell.col - 1);
        setSelectedCell({ ...selectedCell, col: newCol });
      } else if (game) {
        setSelectedCell({ row: 0, col: 0 });
      }
    }
  };

  const handleRight = () => {
    if (showInstructions || showResultDialog) return;

    if (isCaroGame) {
      // For Caro game, navigate selected cell right
      if (selectedCell && game) {
        const newCol = Math.min(game.default_board_width - 1, selectedCell.col + 1);
        setSelectedCell({ ...selectedCell, col: newCol });
      } else if (game && !caroGame.isGameEnded && !caroGame.isAITurn) {
        // Start selection at first cell if no selection
        setSelectedCell({ row: 0, col: 0 });
      }
    } else {
      // For other games, navigate selected cell right
      if (selectedCell && game) {
        const newCol = Math.min(game.default_board_width - 1, selectedCell.col + 1);
        setSelectedCell({ ...selectedCell, col: newCol });
      } else if (game) {
        setSelectedCell({ row: 0, col: 0 });
      }
    }
  };

  const handleUp = () => {
    if (showInstructions || showResultDialog) return;

    if (isCaroGame) {
      // For Caro game, navigate selected cell up
      if (selectedCell && game) {
        const newRow = Math.max(0, selectedCell.row - 1);
        setSelectedCell({ ...selectedCell, row: newRow });
      } else if (game && !caroGame.isGameEnded && !caroGame.isAITurn) {
        // Start selection at first cell if no selection
        setSelectedCell({ row: 0, col: 0 });
      }
    } else {
      // For other games, navigate selected cell up
      if (selectedCell && game) {
        const newRow = Math.max(0, selectedCell.row - 1);
        setSelectedCell({ ...selectedCell, row: newRow });
      } else if (game) {
        setSelectedCell({ row: 0, col: 0 });
      }
    }
  };

  const handleDown = () => {
    if (showInstructions || showResultDialog) return;

    if (isCaroGame) {
      // For Caro game, navigate selected cell down
      if (selectedCell && game) {
        const newRow = Math.min(game.default_board_height - 1, selectedCell.row + 1);
        setSelectedCell({ ...selectedCell, row: newRow });
      } else if (game && !caroGame.isGameEnded && !caroGame.isAITurn) {
        // Start selection at first cell if no selection
        setSelectedCell({ row: 0, col: 0 });
      }
    } else {
      // For other games, navigate selected cell down
      if (selectedCell && game) {
        const newRow = Math.min(game.default_board_height - 1, selectedCell.row + 1);
        setSelectedCell({ ...selectedCell, row: newRow });
      } else if (game) {
        setSelectedCell({ row: 0, col: 0 });
      }
    }
  };

  const handleEnter = () => {
    if (showInstructions || showResultDialog) return;

    if (isCaroGame) {
      // For Caro game, make move if cell is selected and game is active
      if (
        selectedCell &&
        !caroGame.isGameEnded &&
        !caroGame.isAITurn &&
        caroGame.gameState?.currentPlayer === 'player'
      ) {
        caroGame.handleCellClick(selectedCell.row, selectedCell.col);
        setSelectedCell(undefined); // Clear selection after move
      }
    } else if (isTicTacToeGame) {
      if (selectedCell && !ticTacToeGame.isGameEnded) {
        ticTacToeGame.handleCellClick(selectedCell.row, selectedCell.col);
        setSelectedCell(undefined);
      }
    } else {
      // For other games, perform enter action
      if (selectedCell) {
        console.log(`Enter pressed at: row ${selectedCell.row}, col ${selectedCell.col}`);
        // TODO: Implement game-specific enter action
      }
    }
  };

  const handleBack = () => {
    if (showInstructions) {
      handleToggleInstructions();
    } else if (showResultDialog) {
      setShowResultDialog(false);
    } else {
      handleBackToDashboard();
    }
  };

  const handleHint = () => {
    handleToggleInstructions();
  };

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
            {isCaroGame && caroGame.gameState && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {caroGame.getStatusMessage()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điểm hiện tại: {playerScore}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    size="small"
                    onClick={handleSaveGame}
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu ván'}
                  </Button>

                  {caroGame.isGameEnded && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleNewGameFromResult}
                      >
                        New Game
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackToDashboard}
                      >
                        Quay lại
                      </Button>
                    </>
                  )}
                </Box>
                {saveError && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    {saveError}
                  </Typography>
                )}
              </Box>
            )}
            {isTicTacToeGame && ticTacToeGame.gameState && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {ticTacToeGame.getStatusMessage()}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    size="small"
                    onClick={handleSaveGame}
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu ván'}
                  </Button>
                </Box>
                {ticTacToeGame.isGameEnded && (
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={ticTacToeGame.handleReset}
                    >
                      New Game
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            {game && boardCells.length > 0 && (
              <>
                <GameBoard
                  width={game.default_board_width}
                  height={game.default_board_height}
                  cells={boardCells}
                  selectedCell={selectedCell}
                  onCellClick={handleCellClick}
                  disabled={
                    isCaroGame
                      ? caroGame.isGameEnded ||
                        caroGame.isAITurn ||
                        caroGame.gameState?.currentPlayer === 'computer'
                      : isTicTacToeGame
                        ? ticTacToeGame.isGameEnded ||
                          ticTacToeGame.gameState?.currentPlayer ===
                            (playerIcon === 'X' ? 'O' : 'X')
                        : false
                  }
                />
                <FunctionButtons
                  onLeft={handleLeft}
                  onRight={handleRight}
                  onUp={handleUp}
                  onDown={handleDown}
                  onEnter={handleEnter}
                  onBack={handleBack}
                  onHint={handleHint}
                  disabled={{
                    left: showInstructions || showResultDialog,
                    right: showInstructions || showResultDialog,
                    up: showInstructions || showResultDialog,
                    down: showInstructions || showResultDialog,
                    enter:
                      showInstructions ||
                      showResultDialog ||
                      (isCaroGame && (caroGame.isGameEnded || caroGame.isAITurn)) ||
                      (isTicTacToeGame &&
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

      <GameInstructionsDialog
        open={showInstructions}
        instructions={game.instructions}
        onClose={handleToggleInstructions}
      />

      {/* Icon Selector Dialog for games with X/O selection (Caro, Tic-Tac-Toe) */}
      {(isCaroGame || isTicTacToeGame) && (
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

      {/* Game Result Dialog - Common component for all games */}
      {isCaroGame && caroGame.gameState && (
        <GameResultDialog
          open={showResultDialog}
          gameStatus={caroGame.gameState.gameStatus}
          onClose={() => setShowResultDialog(false)}
          onNewGame={handleNewGameFromResult}
          gameName={game.name}
          score={playerScore}
        />
      )}

      {isTicTacToeGame && ticTacToeGame.gameState && (
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
        />
      )}

      {/* Toast for save game result */}
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
