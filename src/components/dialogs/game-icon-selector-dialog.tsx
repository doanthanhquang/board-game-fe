import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

interface GameIconSelectorDialogProps {
  open: boolean;
  playerIcon: 'X' | 'O';
  onChangePlayerIcon: (icon: 'X' | 'O') => void;
  onStart: () => void;
}

export const GameIconSelectorDialog = ({
  open,
  playerIcon,
  onChangePlayerIcon,
  onStart,
}: GameIconSelectorDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={() => {
        // Không cho đóng khi chưa chọn, giống logic cũ
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight="bold">
          Chọn Icon của bạn
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
          <FormLabel component="legend">Bạn muốn chơi với icon nào?</FormLabel>
          <RadioGroup
            row
            value={playerIcon}
            onChange={(e) => onChangePlayerIcon(e.target.value as 'X' | 'O')}
            sx={{ justifyContent: 'center', mt: 2, gap: 4 }}
          >
            <FormControlLabel
              value="X"
              control={<Radio />}
              label={
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  X
                </Typography>
              }
            />
            <FormControlLabel
              value="O"
              control={<Radio />}
              label={
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  O
                </Typography>
              }
            />
          </RadioGroup>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            {playerIcon === 'X'
              ? 'Bạn sẽ chơi X, Computer sẽ chơi O'
              : 'Bạn sẽ chơi O, Computer sẽ chơi X'}
          </Typography>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button variant="contained" onClick={onStart} size="large" sx={{ minWidth: 120 }}>
          Bắt đầu
        </Button>
      </DialogActions>
    </Dialog>
  );
};
