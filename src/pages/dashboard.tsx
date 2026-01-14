import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { getGames, type Game } from '@/api/games';
import { GameMenuDialog } from '@/components/game-menu-dialog';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        const gamesData = await getGames();
        setGames(gamesData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load games. Please try again.';
        setError(errorMessage);
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setShowMenuDialog(true);
  };

  const handleNewGame = (slug: string) => {
    navigate(`/game/${slug}`);
  };

  const handleShowInstructions = (gameInstructions: string | null) => {
    setInstructions(gameInstructions);
    setShowInstructions(true);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    setInstructions(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Board Game
          </Typography>

          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Select a Game
            </Typography>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && games.length === 0 && (
              <Alert severity="info" sx={{ my: 2 }}>
                No games available at the moment.
              </Alert>
            )}

            {!loading && !error && games.length > 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(2, 1fr)',
                  },
                  gap: 3,
                  mt: 2,
                }}
              >
                {games.map((game) => (
                  <Card
                    key={game.id}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleGameClick(game)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {game.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {game.description || 'No description available.'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Game Menu Dialog */}
      <GameMenuDialog
        open={showMenuDialog}
        game={selectedGame}
        onClose={() => setShowMenuDialog(false)}
        onNewGame={handleNewGame}
        onShowInstructions={handleShowInstructions}
      />

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onClose={handleCloseInstructions} maxWidth="md" fullWidth>
        <DialogTitle>Game Instructions</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {instructions || 'No instructions available for this game.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstructions} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
