import { useState, useEffect, useRef } from 'react';
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
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getGames, type Game } from '@/api/games';
import { GameMenuDialog } from '@/components/game-menu-dialog';
import { FunctionButtons } from '@/components/game-board';
import { GameRanking } from '@/components';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [showRankingDialog, setShowRankingDialog] = useState(false);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const gameCardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

  const handleShowRanking = () => {
    if (selectedGame) {
      setShowMenuDialog(false);
      setShowRankingDialog(true);
    }
  };

  const handleShowInstructions = (gameInstructions: string | null) => {
    setInstructions(gameInstructions);
    setShowInstructions(true);
    setShowMenuDialog(false);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    setInstructions(null);
    if (selectedGame) {
      setShowMenuDialog(true);
    }
  };

  const handleCloseRanking = () => {
    setShowRankingDialog(false);
    if (selectedGame) {
      setShowMenuDialog(true);
    }
  };

  // Function button handlers for game selection
  const handleLeft = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      setSelectedGameIndex((prev) => (prev > 0 ? prev - 1 : games.length - 1));
    }
  };

  const handleRight = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      setSelectedGameIndex((prev) => (prev < games.length - 1 ? prev + 1 : 0));
    }
  };

  const handleUp = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      // Move to previous row (assuming 2 columns grid)
      const currentRow = Math.floor(selectedGameIndex / 2);
      const currentCol = selectedGameIndex % 2;
      if (currentRow > 0) {
        const newIndex = (currentRow - 1) * 2 + currentCol;
        setSelectedGameIndex(newIndex);
      } else {
        // Wrap to last row
        const totalRows = Math.ceil(games.length / 2);
        const newIndex = (totalRows - 1) * 2 + currentCol;
        setSelectedGameIndex(Math.min(newIndex, games.length - 1));
      }
    }
  };

  const handleDown = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      // Move to next row (assuming 2 columns grid)
      const currentRow = Math.floor(selectedGameIndex / 2);
      const currentCol = selectedGameIndex % 2;
      const totalRows = Math.ceil(games.length / 2);
      if (currentRow < totalRows - 1) {
        const newIndex = (currentRow + 1) * 2 + currentCol;
        if (newIndex < games.length) {
          setSelectedGameIndex(newIndex);
        }
      } else {
        // Wrap to first row
        setSelectedGameIndex(currentCol);
      }
    }
  };

  const handleEnter = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      const game = games[selectedGameIndex];
      if (game) {
        handleGameClick(game);
      }
    }
  };

  const handleBack = () => {
    if (showMenuDialog) {
      setShowMenuDialog(false);
    } else if (showInstructions) {
      handleCloseInstructions();
    }
  };

  const handleHint = () => {
    // Show help/info about using function buttons
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      const game = games[selectedGameIndex];
      if (game) {
        handleShowInstructions(game.instructions);
      }
    }
  };

  // Scroll selected game into view
  useEffect(() => {
    if (gameCardsRef.current[selectedGameIndex]) {
      gameCardsRef.current[selectedGameIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedGameIndex]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Chào mừng đến với Board Game
          </Typography>

          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Chọn trò chơi
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
                Hiện chưa có trò chơi nào.
              </Alert>
            )}

            {!loading && !error && games.length > 0 && (
              <>
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
                  {games.map((game, index) => (
                    <Card
                      key={game.id}
                      ref={(el) => {
                        gameCardsRef.current[index] = el;
                      }}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border:
                          index === selectedGameIndex && !showMenuDialog && !showInstructions
                            ? '3px solid'
                            : 'none',
                        borderColor: 'primary.main',
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
                <FunctionButtons
                  onLeft={handleLeft}
                  onRight={handleRight}
                  onUp={handleUp}
                  onDown={handleDown}
                  onEnter={handleEnter}
                  onBack={handleBack}
                  onHint={handleHint}
                  disabled={{
                    left: showMenuDialog || showInstructions,
                    right: showMenuDialog || showInstructions,
                    up: showMenuDialog || showInstructions,
                    down: showMenuDialog || showInstructions,
                    enter: showMenuDialog || showInstructions,
                    back: !showMenuDialog && !showInstructions,
                    hint: showMenuDialog || showInstructions,
                  }}
                />
              </>
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
        onShowRanking={handleShowRanking}
      />

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onClose={handleCloseInstructions} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Hướng dẫn trò chơi</Typography>
          <IconButton
            aria-label="Close instructions"
            onClick={handleCloseInstructions}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {instructions || 'Chưa có hướng dẫn cho trò chơi này.'}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Ranking Dialog */}
      <Dialog
        open={showRankingDialog}
        onClose={handleCloseRanking}
        maxWidth="md"
        fullWidth
        aria-labelledby="ranking-dialog-title"
      >
        <DialogTitle
          id="ranking-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">
            {selectedGame ? `Bảng xếp hạng - ${selectedGame.name}` : 'Bảng xếp hạng'}
          </Typography>
          <IconButton aria-label="Close ranking" onClick={handleCloseRanking} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{selectedGame && <GameRanking slug={selectedGame.slug} />}</DialogContent>
      </Dialog>
    </Container>
  );
};
