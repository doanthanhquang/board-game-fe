import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/context/use-auth';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';

export const AppHeader = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          Board Game
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {currentUser && (
            <Typography variant="body1" component="span">
              Xin chào, {currentUser.username}
            </Typography>
          )}
          <ThemeToggle />
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ ml: 1 }}>
            Đăng xuất
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
