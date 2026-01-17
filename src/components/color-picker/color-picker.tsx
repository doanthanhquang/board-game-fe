/**
 * Color Picker Component
 * Allows users to select colors for drawing
 */

import { Box, TextField, Typography, Paper } from '@mui/material';
import { useState } from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
}

/**
 * Color picker component with hex input and preset colors
 */
export const ColorPicker = ({
  selectedColor,
  onColorChange,
  label = 'Color',
}: ColorPickerProps) => {
  const [colorInput, setColorInput] = useState(selectedColor);

  // Preset colors for quick selection
  const presetColors = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#A52A2A', // Brown
    '#808080', // Gray
  ];

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColorInput(value);

    // Validate hex color format
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onColorChange(value);
    }
  };

  const handlePresetClick = (color: string) => {
    setColorInput(color);
    onColorChange(color);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            backgroundColor: selectedColor,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
        <TextField
          type="text"
          value={colorInput}
          onChange={handleColorInputChange}
          placeholder="#000000"
          size="small"
          sx={{ flexGrow: 1 }}
          inputProps={{
            pattern: '#[0-9A-Fa-f]{6}',
            maxLength: 7,
          }}
        />
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => {
            const color = e.target.value;
            setColorInput(color);
            onColorChange(color);
          }}
          style={{
            width: 40,
            height: 40,
            border: 'none',
            cursor: 'pointer',
            borderRadius: 4,
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {presetColors.map((color) => (
          <Box
            key={color}
            onClick={() => handlePresetClick(color)}
            sx={{
              width: 24,
              height: 24,
              backgroundColor: color,
              border: selectedColor === color ? '2px solid' : '1px solid',
              borderColor: selectedColor === color ? 'primary.main' : 'divider',
              borderRadius: 0.5,
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                borderWidth: 2,
              },
            }}
            title={color}
          />
        ))}
      </Box>
    </Paper>
  );
};
