import { useState, useEffect } from 'react';
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

export const GameDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

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

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleToggleInstructions = () => {
    setShowInstructions(!showInstructions);
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
            <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>
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
              onClick={handleBack}
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
            <Typography variant="h6" gutterBottom>
              Game Board (Coming Soon)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Game logic and board will be implemented here.
            </Typography>
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
