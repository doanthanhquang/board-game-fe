import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpIcon from '@mui/icons-material/Help';
import { getGameBySlug, type Game } from '@/api/games';
import { GameBoard, FunctionButtons } from '@/components/game-board';
import type { BoardCell } from '@/types/board';

export const GameDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | undefined>(
    undefined
  );

  // Initialize board cells from game configuration
  const boardCells = useMemo<BoardCell[][]>(() => {
    if (!game) return [];

    const cells: BoardCell[][] = [];
    for (let row = 0; row < game.default_board_height; row++) {
      cells[row] = [];
      for (let col = 0; col < game.default_board_width; col++) {
        cells[row][col] = {
          row,
          col,
          color: null,
          selected: false,
          disabled: false,
        };
      }
    }
    return cells;
  }, [game]);

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

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleToggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // Board cell click handler
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    // TODO: Implement game-specific logic here
    console.log(`Cell clicked: row ${row}, col ${col}`);
  };

  // Function button handlers
  const handleLeft = () => {
    if (selectedCell) {
      const newCol = Math.max(0, selectedCell.col - 1);
      setSelectedCell({ ...selectedCell, col: newCol });
    }
    // TODO: Implement game-specific left navigation
  };

  const handleRight = () => {
    if (selectedCell && game) {
      const newCol = Math.min(game.default_board_width - 1, selectedCell.col + 1);
      setSelectedCell({ ...selectedCell, col: newCol });
    }
    // TODO: Implement game-specific right navigation
  };

  const handleEnter = () => {
    if (selectedCell) {
      // TODO: Implement game-specific enter action
      console.log(`Enter pressed at: row ${selectedCell.row}, col ${selectedCell.col}`);
    }
  };

  const handleBack = () => {
    setSelectedCell(undefined);
    // TODO: Implement game-specific back action
  };

  const handleHint = () => {
    handleToggleInstructions();
    // TODO: Implement game-specific hint/help
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
              {error || 'Game not found'}
            </Alert>
            <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBackToDashboard}>
              Back to Dashboard
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
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToDashboard}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h3" component="h1">
              {game.name}
            </Typography>
            <IconButton
              color="primary"
              onClick={handleToggleInstructions}
              sx={{ ml: 1 }}
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
            {game && boardCells.length > 0 && (
              <>
                <GameBoard
                  width={game.default_board_width}
                  height={game.default_board_height}
                  cells={boardCells}
                  selectedCell={selectedCell}
                  onCellClick={handleCellClick}
                />
                <FunctionButtons
                  onLeft={handleLeft}
                  onRight={handleRight}
                  onEnter={handleEnter}
                  onBack={handleBack}
                  onHint={handleHint}
                />
              </>
            )}
          </Box>
        </Paper>
      </Box>

      <Dialog open={showInstructions} onClose={handleToggleInstructions} maxWidth="md" fullWidth>
        <DialogTitle>Game Instructions</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {game.instructions || 'No instructions available for this game.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggleInstructions} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
