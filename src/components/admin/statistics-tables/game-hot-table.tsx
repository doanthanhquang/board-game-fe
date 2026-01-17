import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Box,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getGameStats, type GameStat } from '@/api/admin';

interface GameHotTableProps {
  limit?: number;
}

/**
 * Game Hot Table Component
 * Displays most played games statistics
 */
export const GameHotTable = ({ limit = 10 }: GameHotTableProps) => {
  const [data, setData] = useState<GameStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await getGameStats(limit);
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Trò chơi phố biến
        </Typography>
        <IconButton size="small" onClick={fetchData} disabled={loading} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : data.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Không có số liệu thống kê trò chơi có sẵn
        </Typography>
      ) : (
        <TableContainer
          sx={{
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Xếp hạng</TableCell>
                <TableCell>Trò chơi</TableCell>
                <TableCell align="right">Lượt chơi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((stat) => (
                <TableRow key={stat.game_id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      #{stat.rank}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{stat.game_name}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{stat.play_count.toLocaleString()}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
