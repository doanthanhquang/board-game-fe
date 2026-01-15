import { Avatar, Box, Typography } from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import type { ProfileUser, ProfileInfo } from '@/api/profile';

interface ProfileHeaderProps {
  user: ProfileUser;
  profile: ProfileInfo;
}

export const ProfileHeader = ({ user, profile }: ProfileHeaderProps) => {
  const displayName = profile.display_name || user.username;
  const avatarUrl = profile.avatar_url;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 4,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Avatar
        src={avatarUrl || undefined}
        sx={{
          width: 120,
          height: 120,
          bgcolor: 'primary.main',
          fontSize: '3rem',
        }}
      >
        {!avatarUrl && <AccountCircleIcon sx={{ fontSize: 120 }} />}
      </Avatar>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {displayName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          @{user.username}
        </Typography>
      </Box>
    </Box>
  );
};
