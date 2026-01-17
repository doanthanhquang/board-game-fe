import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { listAllGames, updateGameConfig, type Game, type UpdateGameConfigData } from '@/api/games';
import { GameForm, AdminSidebar } from '@/components/admin';

/**
 * Admin Game Management page
 * Provides game configuration management
 */
export const AdminGameManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch games
  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAllGames({
        page: page + 1, // API uses 1-based pagination
        pageSize,
        search: searchDebounce || undefined,
      });
      if (response) {
        setGames(response.items);
        setTotal(response.total);
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchDebounce]);

  const handleUpdateGame = async (data: UpdateGameConfigData) => {
    if (!selectedGame) return;
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await updateGameConfig(selectedGame.id, data);
      if (response.success) {
        setFormOpen(false);
        setSelectedGame(null);
        fetchGames();
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setFormError(apiError?.message || 'Failed to update game');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEditForm = (game: Game) => {
    setSelectedGame(game);
    setFormError(null);
    setFormOpen(true);
  };

  const formatTimeLimit = (timeLimit: number | null) => {
    if (timeLimit === null) return 'No limit';
    const minutes = Math.floor(timeLimit / 60);
    const seconds = timeLimit % 60;
    if (minutes > 0) {
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        }}
      >
        <Container maxWidth="xl">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.background.paper
                  : theme.palette.grey[800],
            }}
          >
            {/* Header */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Game Management
              </Typography>
            </Box>

            {/* Search */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ flexGrow: 1, minWidth: 250 }}
              />
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Games Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer
                  sx={{
                    maxHeight: 600,
                    overflow: 'auto',
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Slug</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Board Size</TableCell>
                        <TableCell>Time Limit</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {games.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No games found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        games.map((game) => (
                          <TableRow key={game.id} hover>
                            <TableCell>{game.name}</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {game.slug}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={game.is_enabled ? 'Enabled' : 'Disabled'}
                                size="small"
                                color={game.is_enabled ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              {game.default_board_width} × {game.default_board_height}
                            </TableCell>
                            <TableCell>{formatTimeLimit(game.default_time_limit)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit Game">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditForm(game)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                />
              </>
            )}
          </Paper>
        </Container>

        {/* Game Form Dialog */}
        <GameForm
          open={formOpen}
          game={selectedGame}
          onClose={() => {
            setFormOpen(false);
            setSelectedGame(null);
            setFormError(null);
          }}
          onSubmit={handleUpdateGame}
          loading={formLoading}
          error={formError}
        />
      </Box>
    </Box>
  );
};
