import { Box, Container, Typography, Paper } from '@mui/material';
import { useAuth } from '@/context/use-auth';

/**
 * AdminContentArea component
 * Main content area for admin dashboard
 * Placeholder content - actual management features will be added in separate proposals
 */
export const AdminContentArea = () => {
  const { currentUser } = useAuth();

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
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.background.paper
                : theme.palette.grey[800],
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome to Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome, {currentUser?.username || 'Admin'}!
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This is the admin management interface. Content management features will be added in
            separate proposals.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Available Sections
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the sidebar menu to navigate between admin sections. Additional management
              features will be available soon.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
