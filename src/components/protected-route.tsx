import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/context/use-auth';
import { isAdmin, isClient } from '@/context/auth-context-types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
}

/**
 * ProtectedRoute component
 * Protects routes that require authentication and optionally a specific role
 * @param children - The component to render if access is granted
 * @param requiredRole - Optional role requirement ('admin' or 'client')
 */
export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
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

  // If role is required, check if user has the correct role
  if (requiredRole) {
    // Handle edge cases: no user, no role, invalid role
    if (!currentUser || !currentUser.role) {
      return <Navigate to="/login" replace />;
    }

    // Check if user has the required role
    const hasRequiredRole =
      (requiredRole === 'admin' && isAdmin(currentUser)) ||
      (requiredRole === 'client' && isClient(currentUser));

    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's actual role
      if (isAdmin(currentUser)) {
        return <Navigate to="/admin" replace />;
      } else if (isClient(currentUser)) {
        return <Navigate to="/dashboard" replace />;
      } else {
        // Invalid role, redirect to login
        return <Navigate to="/login" replace />;
      }
    }
  }

  return <>{children}</>;
};
