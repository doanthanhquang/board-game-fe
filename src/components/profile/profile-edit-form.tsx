import { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import type { ProfileInfo, UpdateProfilePayload } from '@/api/profile';

interface ProfileEditFormProps {
  profile: ProfileInfo;
  onSave: (data: UpdateProfilePayload) => Promise<void>;
  onCancel: () => void;
}

export const ProfileEditForm = ({ profile, onSave, onCancel }: ProfileEditFormProps) => {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (displayName.length > 100) {
      setError('Display name must be 100 characters or less');
      setLoading(false);
      return;
    }

    if (bio.length > 500) {
      setError('Bio must be 500 characters or less');
      setLoading(false);
      return;
    }

    if (avatarUrl && avatarUrl.length > 500) {
      setError('Avatar URL must be 500 characters or less');
      setLoading(false);
      return;
    }

    // Validate URL format if provided
    if (avatarUrl && avatarUrl.trim() !== '') {
      try {
        new URL(avatarUrl);
      } catch {
        setError('Avatar URL must be a valid URL format');
        setLoading(false);
        return;
      }
    }

    try {
      await onSave({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Edit Profile
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            fullWidth
            helperText={`${displayName.length}/100 characters`}
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            fullWidth
            multiline
            rows={4}
            helperText={`${bio.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
          />

          <TextField
            label="Avatar URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            fullWidth
            helperText="Enter a URL to an image (HTTP or HTTPS)"
            placeholder="https://example.com/avatar.jpg"
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};
