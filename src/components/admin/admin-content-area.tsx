import { Box, Container, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  GameHotTable,
  NewAccountsTable,
  TopWinnersTable,
  // TopPointsTable,
} from './statistics-tables';
import { useState } from 'react';

/**
 * AdminContentArea component
 * Main content area for admin dashboard with statistics tables
 */
export const AdminContentArea = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshAll = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        minHeight: '100vh',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Thống kê bảng điều khiển
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAll}
              size="small"
            >
              Làm mới tất cả
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Giám sát hoạt động của nền tảng, mức độ tương tác của người dùng và số liệu về mức độ
            phổ biến của trò chơi.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
          }}
        >
          <GameHotTable key={`game-hot-${refreshKey}`} limit={10} />
          <NewAccountsTable key={`new-accounts-${refreshKey}`} limit={20} />
          <TopWinnersTable key={`top-winners-${refreshKey}`} limit={20} />
          {/* <TopPointsTable key={`top-points-${refreshKey}`} limit={20} /> */}
        </Box>
      </Container>
    </Box>
  );
};
