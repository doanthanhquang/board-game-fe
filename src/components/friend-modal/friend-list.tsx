import { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { getFriends, type Friendship } from '@/api/friends';

export const FriendList = () => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    setLoading(true);
    setError(null);

    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
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

  if (friends.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        You don't have any friends yet. Search for users to add friends!
      </Typography>
    );
  }

  return (
    <List>
      {friends.map((friendship) => (
        <ListItem
          key={friendship.id}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 1,
          }}
        >
          <ListItemText primary={friendship.friend.username} secondary={friendship.friend.email} />
        </ListItem>
      ))}
    </List>
  );
};
