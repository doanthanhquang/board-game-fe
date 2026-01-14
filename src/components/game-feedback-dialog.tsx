import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Rating,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createGameRating, getGameRatings, type GameRatingItem } from '@/api/game-feedback';
import { useAuth } from '@/context/use-auth';

interface GameFeedbackDialogProps {
  open: boolean;
  slug: string | null;
  gameName?: string | null;
  onClose: () => void;
}

export const GameFeedbackDialog = ({ open, slug, gameName, onClose }: GameFeedbackDialogProps) => {
  const { isAuthenticated } = useAuth();

  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [items, setItems] = useState<GameRatingItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!slug) {
      return;
    }
    const fetchRatings = async () => {
      try {
        setLoadingList(true);
        setListError(null);
        const data = await getGameRatings(slug, page, pageSize);
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load comments. Please try again.';
        setListError(message);
      } finally {
        setLoadingList(false);
      }
    };
    fetchRatings();
  }, [open, slug, page, pageSize]);

  const resetForm = () => {
    setRating(5);
    setComment('');
    setSubmitError(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = async () => {
    if (!slug) return;
    if (!isAuthenticated) {
      setSubmitError('Bạn cần đăng nhập để gửi đánh giá.');
      return;
    }

    const safeRating = rating ?? 0;
    if (safeRating < 1 || safeRating > 5) {
      setSubmitError('Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await createGameRating(slug, {
        rating: safeRating,
        comment: comment.trim() || undefined,
      });
      // Refresh list from first page to show newest comment
      setPage(1);
      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gửi đánh giá thất bại. Vui lòng thử lại.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="feedback-dialog-title"
    >
      <DialogTitle
        id="feedback-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">
          {gameName ? `Bình luận & đánh giá - ${gameName}` : 'Bình luận & đánh giá'}
        </Typography>
        <IconButton aria-label="Close feedback" onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bạn cần đăng nhập để gửi đánh giá. Bạn vẫn có thể xem bình luận của người khác.
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" gutterBottom>
              Gửi đánh giá của bạn
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating name="game-rating" value={rating} onChange={(_, value) => setRating(value)} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {rating ? `${rating} sao` : 'Chưa chọn'}
              </Typography>
            </Box>
            <TextField
              label="Bình luận (tuỳ chọn)"
              multiline
              minRows={3}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nghĩ của bạn về trò chơi này..."
            />
            {submitError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {submitError}
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              flex: 1.2,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Bình luận của mọi người
            </Typography>
            {loadingList && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {listError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {listError}
              </Alert>
            )}
            {!loadingList && !listError && items.length === 0 && (
              <Alert severity="info">
                Chưa có bình luận nào cho trò chơi này. Hãy là người đầu tiên!
              </Alert>
            )}
            {!loadingList && !listError && items.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  flex: 1,
                  minHeight: 0,
                  maxHeight: { xs: 260, md: 320 },
                  overflowY: 'auto',
                  pr: 1,
                }}
              >
                {items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="subtitle2">{item.username}</Typography>
                      <Rating name="read-only-rating" value={item.rating} size="small" readOnly />
                    </Box>
                    {item.comment && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {item.comment}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
                {total > pageSize && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      size="small"
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Đóng
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !isAuthenticated}
        >
          {submitting ? <CircularProgress size={20} /> : 'Gửi đánh giá'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
