import { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  Badge,
  Pagination,
  Stack,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { getFriends, type Friendship } from '@/api/friends';
import { getConversations, type Conversation } from '@/api/messages';
import { ChatPanel } from '@/components/chat';

const ITEMS_PER_PAGE = 5;

export const FriendList = () => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadFriends(currentPage);
    loadConversations();
  }, [currentPage]);

  const loadFriends = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const friendsList = await getFriends({ page, pageSize: ITEMS_PER_PAGE });
      setFriends(friendsList.items);
      setTotal(friendsList.total);
      setTotalPages(Math.ceil(friendsList.total / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const loadConversations = async () => {
    try {
      const conversationsList = await getConversations();
      setConversations(conversationsList.items);
    } catch (err) {
      // Silently fail - not critical
      console.error('Failed to load conversations:', err);
    }
  };

  const getUnreadStatus = (friendId: string): boolean => {
    const conversation = conversations.find((conv) => conv.friend?.id === friendId);
    return (conversation?.unreadCount || 0) > 0;
  };

  const handleOpenChat = (friend: Friendship) => {
    setSelectedFriend({
      id: friend.friend.id,
      name: friend.friend.username,
    });
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedFriend(null);
    // Refresh conversations to update unread status
    loadConversations();
  };

  const handleMessageSent = () => {
    // Refresh conversations after sending message
    loadConversations();
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
    <>
      <List>
        {friends.map((friendship) => {
          const hasUnread = getUnreadStatus(friendship.friend.id);

          return (
            <ListItem
              key={friendship.id}
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
                primary={friendship.friend.username}
                secondary={friendship.friend.email}
              />
              <Badge
                variant="dot"
                color="error"
                invisible={!hasUnread}
                sx={{
                  '& .MuiBadge-dot': {
                    width: 8,
                    height: 8,
                  },
                }}
              >
                <IconButton
                  edge="end"
                  color="primary"
                  onClick={() => handleOpenChat(friendship)}
                  aria-label="open chat"
                  size="small"
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            </ListItem>
          );
        })}
      </List>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
          <Typography variant="body2" color="text.secondary">
            Showing {friends.length} of {total} friends
          </Typography>
        </Stack>
      )}

      {selectedFriend && (
        <ChatPanel
          open={chatOpen}
          onClose={handleCloseChat}
          friendId={selectedFriend.id}
          friendName={selectedFriend.name}
          onMessageSent={handleMessageSent}
        />
      )}
    </>
  );
};
