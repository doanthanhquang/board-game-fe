/**
 * Dashboard Page
 * Main dashboard page displayed after successful login
 */

import { Box, Container, Typography, Paper } from '@mui/material';
import { useAuth } from '@/context/use-auth';

export const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Dashboard
          </Typography>

          {currentUser && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {currentUser.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Username:</strong> {currentUser.username}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Role:</strong> {currentUser.role}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Mock Content
            </Typography>
            <Typography variant="body1" paragraph>
              This is a placeholder dashboard page. Future game features and user statistics will be
              displayed here.
            </Typography>
            <Typography variant="body1" paragraph>
              You can navigate to different sections of the application from here.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
