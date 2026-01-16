import { useState, type KeyboardEvent } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput = ({ onSend, disabled = false }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending || disabled) {
      return;
    }

    setSending(true);
    try {
      await onSend(trimmedMessage);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Keep message in input on error so user can retry
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled || sending}
        variant="outlined"
        size="small"
      />
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!message.trim() || sending || disabled}
        aria-label="send message"
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};
