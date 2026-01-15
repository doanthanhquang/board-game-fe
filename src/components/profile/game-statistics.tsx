import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import type { UserStatistics } from '@/api/profile';

interface GameStatisticsProps {
  statistics: UserStatistics;
}

export const GameStatistics = ({ statistics }: GameStatisticsProps) => {
  const { games, total_games_played, total_wins, win_rate } = statistics;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Overall Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Games Played
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {total_games_played}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Wins
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {total_wins}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Win Rate
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {win_rate.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Best Results by Game
        </Typography>
        {games.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No games available
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Game</TableCell>
                  <TableCell align="center">Best Moves</TableCell>
                  <TableCell align="center">Best Score</TableCell>
                  <TableCell align="center">Wins</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.game_id}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {game.game_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {game.best_moves !== null ? (
                        <Typography variant="body2">{game.best_moves}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {game.best_score !== null ? (
                        <Typography variant="body2">{game.best_score}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {game.wins}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {game.has_played ? (
                        <Chip
                          icon={<TrophyIcon />}
                          label="Played"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Chip label="Not Played" color="default" size="small" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
