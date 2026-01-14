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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
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
import { GameResultDialog } from '@/components/game-result-dialog';
import type { BoardCell } from '@/types/board';
import { useCaroGame } from '@/hooks/use-caro-game';

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
  const isCaroGame = game?.slug === 'caro-4' || game?.slug === 'caro-5';
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
    if (isCaroGame && game && !showIconSelector && !caroGame.gameState && !shouldContinue) {
      setShowIconSelector(true);
    }
  }, [isCaroGame, game, showIconSelector, caroGame.gameState, shouldContinue]);

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
    if (isCaroGame) {
      setShowIconSelector(true);
    }
  };

  // Initialize board cells from game configuration
  const boardCells = useMemo<BoardCell[][]>(() => {
    if (!game) return [];

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
  }, [game, isCaroGame, caroGame.boardCells, selectedCell]);

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
        const state = await loadGameSave(slug, latest.id);

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

  // Show result dialog when game ends
  useEffect(() => {
    if (isCaroGame && caroGame.isGameEnded && caroGame.gameState) {
      setShowResultDialog(true);
    }
  }, [isCaroGame, caroGame.isGameEnded, caroGame.gameState]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleToggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const handleSaveGame = async () => {
    if (!isCaroGame || !slug) return;
    const state = caroGame.getSerializableState();
    if (!state) return;

    try {
      setSaving(true);
      setSaveError(null);
      await saveGameState(slug, { gameState: state });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu ván chơi.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  // Board cell click handler
  const handleCellClick = (row: number, col: number) => {
    if (isCaroGame) {
      caroGame.handleCellClick(row, col);
      setSelectedCell(undefined); // Clear selection after move
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
                      (isCaroGame && (caroGame.isGameEnded || caroGame.isAITurn)),
                    back: false,
                    hint: showResultDialog,
                  }}
                />
              </>
            )}
          </Box>
        </Paper>
      </Box>

      <Dialog open={showInstructions} onClose={handleToggleInstructions} maxWidth="md" fullWidth>
        <DialogTitle>Hướng dẫn trò chơi</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {game.instructions || 'Chưa có hướng dẫn cho trò chơi này.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggleInstructions} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Icon Selector Dialog for Caro Game */}
      {isCaroGame && (
        <Dialog
          open={showIconSelector}
          onClose={() => {}} // Prevent closing without selection
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle>
            <Typography variant="h5" component="div" fontWeight="bold">
              Chọn Icon của bạn
            </Typography>
          </DialogTitle>
          <DialogContent>
            <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
              <FormLabel component="legend">Bạn muốn chơi với icon nào?</FormLabel>
              <RadioGroup
                row
                value={playerIcon}
                onChange={(e) => setPlayerIcon(e.target.value as 'X' | 'O')}
                sx={{ justifyContent: 'center', mt: 2, gap: 4 }}
              >
                <FormControlLabel
                  value="X"
                  control={<Radio />}
                  label={
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      X
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="O"
                  control={<Radio />}
                  label={
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      O
                    </Typography>
                  }
                />
              </RadioGroup>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: 'center' }}
              >
                {playerIcon === 'X'
                  ? 'Bạn sẽ chơi X, Computer sẽ chơi O'
                  : 'Bạn sẽ chơi O, Computer sẽ chơi X'}
              </Typography>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
            <Button
              variant="contained"
              onClick={() => {
                setShowIconSelector(false);
              }}
              size="large"
              sx={{ minWidth: 120 }}
            >
              Bắt đầu
            </Button>
          </DialogActions>
        </Dialog>
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
    </Container>
  );
};
