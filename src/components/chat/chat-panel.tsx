import { useState, useEffect } from 'react';
import { Drawer, Box, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { getConversation, sendMessage, markConversationRead, type Message } from '@/api/messages';

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  friendId: string;
  friendName: string;
  onMessageSent?: () => void;
}

export const ChatPanel = ({
  open,
  onClose,
  friendId,
  friendName,
  onMessageSent,
}: ChatPanelProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages when panel opens
  useEffect(() => {
    if (open && friendId) {
      loadMessages();
      markAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, friendId]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const conversationMessages = await getConversation(friendId);
      setMessages(conversationMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await markConversationRead(friendId);
      onMessageSent?.(); // Notify parent to refresh unread status
    } catch (err) {
      // Silently fail - not critical
      console.error('Failed to mark conversation as read:', err);
    }
  };

  const handleSendMessage = async (messageBody: string) => {
    try {
      await sendMessage(friendId, messageBody);
      // Reload messages to show the new one
      await loadMessages();
      onMessageSent?.(); // Notify parent to refresh unread status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleClose = () => {
    setMessages([]);
    setError(null);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="div">
            {friendName}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Message List */}
        <MessageList messages={messages} loading={loading} error={error} />

        {/* Message Input */}
        <MessageInput onSend={handleSendMessage} disabled={loading} />
      </Box>
    </Drawer>
  );
};
