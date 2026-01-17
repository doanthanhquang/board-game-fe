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
          Thống kê chung
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tổng số trò chơi đã chơi
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {total_games_played}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tổng số lần thắng
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {total_wins}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tỷ lệ thắng
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {win_rate.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Kết quả tốt nhất theo trò chơi
        </Typography>
        {games.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Không có trò chơi nào
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Game</TableCell>
                  <TableCell align="center">Nước đi tốt nhất</TableCell>
                  <TableCell align="center">Điểm cao nhất</TableCell>
                  <TableCell align="center">Số lần thắng</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
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
                          label="Đã chơi"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Chip label="Chưa chơi" color="default" size="small" variant="outlined" />
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
