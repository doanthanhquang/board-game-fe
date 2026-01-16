import { Card, CardContent, Box, Typography, Badge, LinearProgress, Avatar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Achievement } from '@/api/achievements';

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const isUnlocked = achievement.is_unlocked || false;
  const progress = achievement.progress || 0;
  const hasProgress = progress > 0 && progress < 100;

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isUnlocked ? 1 : 0.7,
        filter: isUnlocked ? 'none' : 'grayscale(100%)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Icon and Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Badge
            badgeContent={
              isUnlocked ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <LockIcon sx={{ fontSize: 16 }} />
              )
            }
            color="default"
          >
            <Avatar
              src={achievement.icon_url || undefined}
              sx={{
                width: 56,
                height: 56,
                bgcolor: isUnlocked ? 'primary.main' : 'grey.300',
                color: isUnlocked ? 'primary.contrastText' : 'grey.600',
              }}
            >
              {!achievement.icon_url && achievement.name.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
          {isUnlocked && achievement.unlocked_at && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {formatDate(achievement.unlocked_at)}
            </Typography>
          )}
        </Box>

        {/* Name */}
        <Typography variant="h6" component="h3" sx={{ mb: 0.5, fontSize: '1rem', fontWeight: 600 }}>
          {achievement.name}
        </Typography>

        {/* Description */}
        {achievement.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexGrow: 1 }}>
            {achievement.description}
          </Typography>
        )}

        {/* Progress Bar */}
        {hasProgress && (
          <Box sx={{ mt: 'auto', pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
