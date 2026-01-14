import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface GameInstructionsDialogProps {
  open: boolean;
  instructions: string | null | undefined;
  onClose: () => void;
}

export const GameInstructionsDialog = ({
  open,
  instructions,
  onClose,
}: GameInstructionsDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Hướng dẫn trò chơi</DialogTitle>
      <DialogContent>
        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
          {instructions || 'Chưa có hướng dẫn cho trò chơi này.'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
