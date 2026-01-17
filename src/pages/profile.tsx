import { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Alert, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { getProfile, updateProfile, type ProfileData } from '@/api/profile';
import {
  ProfileHeader,
  ProfileInfo,
  GameStatistics,
  ProfileEditForm,
  Achievements,
} from '@/components/profile';
import { useAuth } from '@/context/use-auth';
import { isAdmin } from '@/context/auth-context-types';

export const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useAuth();
  const userIsAdmin = isAdmin(currentUser);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProfile();
      setProfileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updateData: Parameters<typeof updateProfile>[0]) => {
    try {
      const updatedData = await updateProfile(updateData);
      setProfileData(updatedData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadProfile}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {!isEditing && (
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </Box>

      {isEditing ? (
        <ProfileEditForm
          profile={profileData.profile}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <ProfileHeader user={profileData.user} profile={profileData.profile} />
          <ProfileInfo user={profileData.user} profile={profileData.profile} />
          {!userIsAdmin && profileData.statistics && (
            <GameStatistics statistics={profileData.statistics} />
          )}
          {!userIsAdmin && (
            <Box sx={{ mt: 4 }}>
              <Achievements />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
