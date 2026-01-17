/**
 * Saved Drawings List Component
 * Modal/dialog showing all saved drawings for the current game
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect, useCallback } from 'react';
import { listGameSaves, loadGameSave, type GameSaveSummary } from '@/api/games';
import type { FreeDrawGameState } from '@/types/game-state';

interface SavedDrawingsListProps {
  open: boolean;
  onClose: () => void;
  gameSlug: string;
  onLoad: (state: FreeDrawGameState) => void;
  onDelete?: (saveId: string) => Promise<void>;
}

/**
 * Saved drawings list modal component
 */
export const SavedDrawingsList = ({
  open,
  onClose,
  gameSlug,
  onLoad,
  onDelete,
}: SavedDrawingsListProps) => {
  const [saves, setSaves] = useState<GameSaveSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const savedDrawings = await listGameSaves(gameSlug);
      setSaves(savedDrawings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved drawings');
    } finally {
      setLoading(false);
    }
  }, [gameSlug]);

  // Fetch saved drawings when dialog opens
  useEffect(() => {
    if (open && gameSlug) {
      fetchSaves();
    }
  }, [open, gameSlug, fetchSaves]);

  const handleLoad = async (saveId: string) => {
    try {
      const savedState = await loadGameSave(gameSlug, saveId);
      onLoad(savedState as FreeDrawGameState);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drawing');
    }
  };

  const handleDelete = async (saveId: string) => {
    if (!onDelete) {
      return;
    }

    if (!window.confirm('Are you sure you want to delete this drawing?')) {
      return;
    }

    setDeletingId(saveId);
    try {
      await onDelete(saveId);
      setSaves(saves.filter((save) => save.id !== saveId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete drawing');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>My Drawings</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!loading && !error && saves.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No saved drawings yet. Save your current drawing to see it here.
            </Typography>
          </Box>
        )}

        {!loading && saves.length > 0 && (
          <List>
            {saves.map((save) => (
              <ListItem key={save.id} divider>
                <ListItemText
                  primary={save.save_name}
                  secondary={`Saved: ${formatDate(save.created_at)}`}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleLoad(save.id)}
                    sx={{ mr: 1 }}
                  >
                    Load
                  </Button>
                  {onDelete && (
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(save.id)}
                      disabled={deletingId === save.id}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
