import { Box, Typography, Paper, Divider } from '@mui/material';
import {
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import type { ProfileUser, ProfileInfo as ProfileInfoType } from '@/api/profile';

interface ProfileInfoProps {
  user: ProfileUser;
  profile: ProfileInfoType;
}

export const ProfileInfo = ({ user, profile }: ProfileInfoProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Thông tin
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="action" />
          <Typography variant="body1">
            <strong>Email:</strong> {user.email}
          </Typography>
        </Box>

        {profile.bio && (
          <>
            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Giới thiệu:</strong>
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {profile.bio}
              </Typography>
            </Box>
          </>
        )}

        <Divider />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon color="action" />
          <Typography variant="body2" color="text.secondary">
            <strong>Thành viên từ:</strong> {formatDate(user.created_at)}
          </Typography>
        </Box>

        {user.last_login_at && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              <strong>Đăng nhập gần nhất:</strong> {formatDate(user.last_login_at)}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
