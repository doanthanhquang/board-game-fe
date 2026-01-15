import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '@/context/use-auth';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { FriendModal } from '@/components/friend-modal';
import { getFriendRequests } from '@/api/friends';

export const AppHeader = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Fetch pending friend requests count
  const fetchPendingRequestsCount = async () => {
    if (!isAuthenticated) return;

    try {
      const requests = await getFriendRequests();
      // Count only received requests (not sent ones)
      const receivedRequests = requests.filter((req) => !req.isRequester);
      setPendingRequestsCount(receivedRequests.length);
    } catch (error) {
      // Silently fail - don't show error in header
      console.error('Failed to fetch friend requests count:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingRequestsCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchPendingRequestsCount, 30000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleOpenFriendModal = () => {
    setFriendModalOpen(true);
  };

  const handleCloseFriendModal = () => {
    setFriendModalOpen(false);
    // Refresh count when modal closes (in case requests were accepted/rejected)
    fetchPendingRequestsCount();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component="div"
          onClick={handleGoToDashboard}
          sx={{ cursor: 'pointer' }}
        >
          Board Game
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {currentUser && (
            <Typography variant="body1" component="span">
              Xin chào, {currentUser.username}
            </Typography>
          )}
          <Button
            color="inherit"
            startIcon={
              <Badge
                badgeContent={pendingRequestsCount > 0 ? pendingRequestsCount : undefined}
                color="error"
              >
                <PeopleIcon />
              </Badge>
            }
            onClick={handleOpenFriendModal}
            sx={{ ml: 1 }}
          >
            Friends
          </Button>
          <ThemeToggle />
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ ml: 1 }}>
            Đăng xuất
          </Button>
        </Box>
      </Toolbar>
      <FriendModal
        open={friendModalOpen}
        onClose={handleCloseFriendModal}
        onRequestCountChange={fetchPendingRequestsCount}
      />
    </AppBar>
  );
};
