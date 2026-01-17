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
import { getNewAccounts, type NewAccount } from '@/api/admin';

interface NewAccountsTableProps {
  limit?: number;
}

/**
 * New Accounts Table Component
 * Displays recent user registrations
 */
export const NewAccountsTable = ({ limit = 20 }: NewAccountsTableProps) => {
  const [data, setData] = useState<NewAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await getNewAccounts(limit);
      setData(accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load new accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          New Accounts
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
          No new accounts available
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
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Registered</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((account) => (
                <TableRow key={account.user_id} hover>
                  <TableCell>
                    <Typography variant="body2">{account.username}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {account.email}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(account.created_at)}
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
