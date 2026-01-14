import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@/context/use-auth';
import type { LoginRequest } from '@/api/auth';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isEmail, setIsEmail] = useState(true);
  const [successToastOpen, setSuccessToastOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const handleToggleEmailUsername = () => {
    setIsEmail(!isEmail);
    setFormData((prev) => ({ email: '', username: '', password: prev.password }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.password || (!formData.email && !formData.username)) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    // Email format validation if using email
    if (isEmail && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Vui lòng nhập đúng định dạng email');
      setLoading(false);
      return;
    }

    try {
      const credentials: LoginRequest = {
        password: formData.password,
        ...(isEmail ? { email: formData.email } : { username: formData.username }),
      };

      await login(credentials);
      setSuccessToastOpen(true);
      // Chờ một chút để người dùng kịp thấy toast rồi chuyển sang dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Board Game
          </Typography>
          <Typography component="h2" variant="h5" align="center" gutterBottom>
            Đăng nhập
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={handleToggleEmailUsername}
                sx={{ textTransform: 'none' }}
              >
                Sử dụng {isEmail ? 'Tên đăng nhập' : 'Email'} để đăng nhập
              </Button>
            </Box>

            {isEmail ? (
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email || ''}
                onChange={handleChange}
                disabled={loading}
              />
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Tên đăng nhập"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username || ''}
                onChange={handleChange}
                disabled={loading}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Ẩn/hiện mật khẩu"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>

            <Button
              fullWidth
              variant="text"
              sx={{ textTransform: 'none' }}
              onClick={() => navigate('/register')}
              disabled={loading}
            >
              Chưa có tài khoản? Đăng ký
            </Button>
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={successToastOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessToastOpen(false)} severity="success" sx={{ width: '100%' }}>
          Đăng nhập thành công!
        </Alert>
      </Snackbar>
    </Container>
  );
};
