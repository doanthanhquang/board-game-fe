/**
 * App Footer Component
 * Simple footer displaying the application name
 */

import { Box, Typography } from '@mui/material';
import { useAuth } from '@/context/use-auth';

export const AppFooter = () => {
  const { currentUser } = useAuth();
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        px: 3,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        {currentUser?.username}
      </Typography>
    </Box>
  );
};
