import { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Divider,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Cancel as CancelIcon } from '@mui/icons-material';
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  type FriendRequest,
} from '@/api/friends';

interface FriendRequestsProps {
  onRequestUpdated?: () => void;
  onRequestCountChange?: () => void;
}

export const FriendRequests = ({ onRequestUpdated, onRequestCountChange }: FriendRequestsProps) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestsList = await getFriendRequests();
      setRequests(requestsList.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setProcessing(requestId);
    setError(null);

    try {
      await acceptFriendRequest(requestId);
      await loadRequests();
      onRequestUpdated?.();
      onRequestCountChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept friend request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    setError(null);

    try {
      await rejectFriendRequest(requestId);
      await loadRequests();
      onRequestCountChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject friend request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  const receivedRequests = requests.filter((req) => !req.isRequester);
  const sentRequests = requests.filter((req) => req.isRequester);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Received Requests */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Yêu cầu nhận ({receivedRequests.length})
        </Typography>
        {receivedRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Không có yêu cầu nhận bạn bè
          </Typography>
        ) : (
          <List>
            {receivedRequests.map((request) => (
              <ListItem
                key={request.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ListItemText
                  primary={request.otherUser?.username || 'Unknown User'}
                  secondary={request.otherUser?.email || ''}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleAccept(request.id)}
                    disabled={processing === request.id}
                    size="small"
                  >
                    {processing === request.id ? <CircularProgress size={16} /> : 'Chấp nhận'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    size="small"
                  >
                    Từ chối
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      {/* Sent Requests */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Yêu cầu gửi ({sentRequests.length})
        </Typography>
        {sentRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Không có yêu cầu gửi bạn bè
          </Typography>
        ) : (
          <List>
            {sentRequests.map((request) => (
              <ListItem
                key={request.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ListItemText
                  primary={request.otherUser?.username || 'Unknown User'}
                  secondary={request.otherUser?.email || ''}
                />
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                  size="small"
                >
                  {processing === request.id ? <CircularProgress size={16} /> : 'Hủy'}
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};
