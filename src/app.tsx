import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Login } from '@/pages/login';
import { Register } from '@/pages/register';
import { Dashboard } from '@/pages/dashboard';
import { GameDetail } from '@/pages/game-detail';
import { Profile } from '@/pages/profile';
import { AdminDashboard } from '@/pages/admin-dashboard';
import { AdminUserManagement } from '@/pages/admin-user-management';
import { AdminGameManagement } from '@/pages/admin-game-management';
import { ProtectedRoute } from '@/components/protected-route';
import { AppHeader } from '@/components/app-header';
import { AuthProvider } from '@/context/auth-context';
import { useAuth } from '@/context/use-auth';
import { isAdmin, isClient } from '@/context/auth-context-types';

/**
 * RootRedirect component
 * Handles root route (/) redirect based on authentication status and user role
 */
const RootRedirect = () => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (currentUser) {
    if (isAdmin(currentUser)) {
      return <Navigate to="/admin" replace />;
    } else if (isClient(currentUser)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Fallback to login if role is invalid
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppHeader />
        <Box component="main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="client">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/games"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminGameManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:slug"
              element={
                <ProtectedRoute requiredRole="client">
                  <GameDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </Box>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
