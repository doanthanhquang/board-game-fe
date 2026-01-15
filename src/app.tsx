import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Login } from '@/pages/login';
import { Register } from '@/pages/register';
import { Dashboard } from '@/pages/dashboard';
import { GameDetail } from '@/pages/game-detail';
import { Profile } from '@/pages/profile';
import { ProtectedRoute } from '@/components/protected-route';
import { AppHeader } from '@/components/app-header';
import { AuthProvider } from '@/context/auth-context';

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
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:slug"
              element={
                <ProtectedRoute>
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
