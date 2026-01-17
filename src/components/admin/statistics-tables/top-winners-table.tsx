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
import { getTopWinners, type TopWinner } from '@/api/admin';

interface TopWinnersTableProps {
  limit?: number;
}

/**
 * Top Winners Table Component
 * Displays users with most wins
 */
export const TopWinnersTable = ({ limit = 20 }: TopWinnersTableProps) => {
  const [data, setData] = useState<TopWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const winners = await getTopWinners(limit);
      setData(winners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load top winners');
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
          Top Winners
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
          No winners data available
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
                <TableCell>Rank</TableCell>
                <TableCell>Username</TableCell>
                <TableCell align="right">Wins</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((winner) => (
                <TableRow key={winner.user_id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      #{winner.rank}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{winner.username}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {winner.total_wins.toLocaleString()}
                    </Typography>
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
