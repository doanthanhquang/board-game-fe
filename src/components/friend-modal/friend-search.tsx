import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { searchUsers, sendFriendRequest, type FriendUser } from '@/api/friends';
import { useAuth } from '@/context/use-auth';

interface FriendSearchProps {
  onRequestSent?: () => void;
}

export const FriendSearch = ({ onRequestSent }: FriendSearchProps) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  // Debounce search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchUsers(query);
      // Filter out current user
      const filteredResults = results.filter((user) => user.id !== currentUser?.id);
      setSearchResults(filteredResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setSendingRequest(userId);
    setError(null);

    try {
      await sendFriendRequest(userId);
      setSentRequests((prev) => new Set(prev).add(userId));
      onRequestSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="Search by name or email"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Enter username or email..."
        InputProps={{
          endAdornment: loading ? <CircularProgress size={20} /> : null,
        }}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {searchResults.length > 0 && (
        <List>
          {searchResults.map((user) => {
            const isRequestSent = sentRequests.has(user.id);
            const isSending = sendingRequest === user.id;

            return (
              <ListItem
                key={user.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemText primary={user.username} secondary={user.email} />
                <Button
                  variant={isRequestSent ? 'outlined' : 'contained'}
                  startIcon={<PersonAddIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendRequest(user.id);
                  }}
                  disabled={isRequestSent || isSending}
                  size="small"
                >
                  {isSending ? (
                    <CircularProgress size={16} />
                  ) : isRequestSent ? (
                    'Request Sent'
                  ) : (
                    'Add Friend'
                  )}
                </Button>
              </ListItem>
            );
          })}
        </List>
      )}

      {searchQuery.trim().length >= 2 && !loading && searchResults.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No users found matching "{searchQuery}"
        </Typography>
      )}

      {searchQuery.trim().length < 2 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Enter at least 2 characters to search
        </Typography>
      )}
    </Box>
  );
};
