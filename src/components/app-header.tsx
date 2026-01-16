import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '@/context/use-auth';
import { useNavigate } from 'react-router-dom';
import { FriendModal } from '@/components/friend-modal';
import { getFriendRequests } from '@/api/friends';
import { useTheme } from '@/theme';

export const AppHeader = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Fetch pending friend requests count
  const fetchPendingRequestsCount = async () => {
    if (!isAuthenticated) return;

    try {
      const requests = await getFriendRequests();
      // Count only received requests (not sent ones)
      const receivedRequests = requests.items.filter((req) => !req.isRequester);
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

  const handleGoToProfile = () => {
    navigate('/profile');
    handleCloseMenu();
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    handleCloseMenu();
  };

  const handleMenuFriendClick = () => {
    handleCloseMenu();
    handleOpenFriendModal();
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
            <Button
              color="inherit"
              onClick={handleOpenMenu}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {currentUser.username}
            </Button>
          )}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleGoToProfile}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleToggleTheme}>
              <ListItemIcon>
                {mode === 'dark' ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuFriendClick}>
              <ListItemIcon>
                <Badge
                  badgeContent={pendingRequestsCount > 0 ? pendingRequestsCount : undefined}
                  color="error"
                >
                  <PeopleIcon fontSize="small" />
                </Badge>
              </ListItemIcon>
              <ListItemText>Friends</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Đăng xuất</ListItemText>
            </MenuItem>
          </Menu>
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
