import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { getAchievements, type Achievement } from '@/api/achievements';
import { AchievementCard } from './achievement-card';

export const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const achievementsList = await getAchievements();
      setAchievements(achievementsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  // Group achievements by category (global vs game-specific)
  const globalAchievements = achievements.filter((a) => !a.game_id);
  const gameAchievements = achievements.filter((a) => a.game_id);

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Achievements
      </Typography>

      {achievements.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No achievements available yet.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Global Achievements */}
          {globalAchievements.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 500 }}>
                Global Achievements
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {globalAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </Box>
            </Box>
          )}

          {/* Game-Specific Achievements */}
          {gameAchievements.length > 0 && (
            <Box>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 500 }}>
                Game Achievements
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {gameAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
