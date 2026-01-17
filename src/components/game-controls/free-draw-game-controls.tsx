/**
 * Free Draw Game Controls Component
 */

import { Box, Typography, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import CollectionsIcon from '@mui/icons-material/Collections';
import { ColorPicker } from '@/components/color-picker/color-picker';

interface FreeDrawGameControlsProps {
  selectedColor: string;
  saving: boolean;
  saveError: string | null;
  onColorChange: (color: string) => void;
  onSave: () => void;
  onShowDrawings: () => void;
  onClearBoard: () => void;
}

export const FreeDrawGameControls = ({
  selectedColor,
  saving,
  saveError,
  onColorChange,
  onSave,
  onShowDrawings,
  onClearBoard,
}: FreeDrawGameControlsProps) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={onColorChange}
            label="Select Color"
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            size="small"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Đang lưu' : 'Lưu bản vẽ'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CollectionsIcon />}
            size="small"
            onClick={onShowDrawings}
          >
            Bản vẽ của tôi
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="small"
            onClick={onClearBoard}
          >
            Xóa bảng
          </Button>
        </Box>
      </Box>
      {saveError && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {saveError}
        </Typography>
      )}
    </Box>
  );
};
