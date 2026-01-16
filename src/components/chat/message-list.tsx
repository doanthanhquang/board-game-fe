import { useEffect, useRef } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import type { Message } from '@/api/messages';
import { useAuth } from '@/context/use-auth';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export const MessageList = ({
  messages,
  loading,
  error,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: MessageListProps) => {
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const previousMessagesLength = useRef(messages.length);

  // Auto-scroll to bottom when new messages are added (not when loading more)
  useEffect(() => {
    if (messages.length > previousMessagesLength.current) {
      // New messages added, scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    previousMessagesLength.current = messages.length;
  }, [messages.length]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // For older messages, show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
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
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          py: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No messages yet. Start the conversation!
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* Load More Button */}
      {hasMore && (
        <Box
          ref={messagesTopRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 1,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={onLoadMore}
            disabled={loadingMore}
            sx={{ minWidth: 120 }}
          >
            {loadingMore ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </Box>
      )}

      {messages.map((message) => {
        const isSent = message.sender_id === currentUser?.id;

        return (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: isSent ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '70%',
                bgcolor: isSent ? 'primary.main' : 'background.paper',
                color: isSent ? 'primary.contrastText' : 'text.primary',
                border: isSent ? 'none' : '1px solid',
                borderColor: 'divider',
              }}
            >
              {!isSent && message.sender && (
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
                  {message.sender.username}
                </Typography>
              )}
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {message.body}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                  fontSize: '0.7rem',
                }}
              >
                {formatTimestamp(message.created_at)}
              </Typography>
            </Paper>
          </Box>
        );
      })}
      <div ref={messagesEndRef} />
    </Box>
  );
};
