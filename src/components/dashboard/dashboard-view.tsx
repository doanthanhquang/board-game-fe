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
import type { Game } from '@/api/games';
import { FunctionButtons } from '@/components/game-board';
import { GameRanking, GameFeedbackDialog, GameMenuDialog } from '@/components';

interface DashboardViewProps {
  games: Game[];
  loading: boolean;
  error: string | null;
  selectedGame: Game | null;
  showMenuDialog: boolean;
  showInstructions: boolean;
  instructions: string | null;
  showRankingDialog: boolean;
  showFeedbackDialog: boolean;
  selectedGameIndex: number;
  canContinueSelectedGame: boolean;
  gameCardsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onGameClick: (game: Game) => void;
  onNewGame: (slug: string) => void;
  onContinueGame: (slug: string) => void;
  onShowRanking: () => void;
  onShowInstructions: (gameInstructions: string | null) => void;
  onCloseInstructions: () => void;
  onCloseRanking: () => void;
  onShowComments: () => void;
  onCloseFeedback: () => void;
  onLeft: () => void;
  onRight: () => void;
  onUp: () => void;
  onDown: () => void;
  onEnter: () => void;
  onBack: () => void;
  onHint: () => void;
  onCloseMenuDialog: () => void;
}

export const DashboardView = ({
  games,
  loading,
  error,
  selectedGame,
  showMenuDialog,
  showInstructions,
  instructions,
  showRankingDialog,
  showFeedbackDialog,
  selectedGameIndex,
  canContinueSelectedGame,
  gameCardsRef,
  onGameClick,
  onNewGame,
  onContinueGame,
  onShowRanking,
  onShowInstructions,
  onCloseInstructions,
  onCloseRanking,
  onShowComments,
  onCloseFeedback,
  onLeft,
  onRight,
  onUp,
  onDown,
  onEnter,
  onBack,
  onHint,
  onCloseMenuDialog,
}: DashboardViewProps) => {
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
                        onClick={() => onGameClick(game)}
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
                  onLeft={onLeft}
                  onRight={onRight}
                  onUp={onUp}
                  onDown={onDown}
                  onEnter={onEnter}
                  onBack={onBack}
                  onHint={onHint}
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
        onClose={onCloseMenuDialog}
        onNewGame={onNewGame}
        onContinue={onContinueGame}
        canContinue={canContinueSelectedGame}
        onShowInstructions={onShowInstructions}
        onShowRanking={onShowRanking}
        onShowComments={onShowComments}
      />

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onClose={onCloseInstructions} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Hướng dẫn trò chơi
          <IconButton aria-label="Close instructions" onClick={onCloseInstructions} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {instructions || 'Chưa có hướng dẫn cho trò chơi này.'}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Ranking Dialog */}
      <Dialog
        open={showRankingDialog}
        onClose={onCloseRanking}
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
          {selectedGame ? `Bảng xếp hạng - ${selectedGame.name}` : 'Bảng xếp hạng'}
          <IconButton aria-label="Close ranking" onClick={onCloseRanking} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedGame && <GameRanking slug={selectedGame.slug} />}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <GameFeedbackDialog
        open={showFeedbackDialog}
        slug={selectedGame?.slug ?? null}
        gameName={selectedGame?.name ?? null}
        onClose={onCloseFeedback}
      />
    </Container>
  );
};
