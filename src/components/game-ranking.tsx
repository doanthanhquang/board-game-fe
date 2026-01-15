import { useEffect, useState } from 'react';
import { Box, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { getGameRankings, type GameRankingEntry } from '@/api/games';

interface GameRankingProps {
  slug: string;
}

/**
 * GameRanking component
 * Bảng xếp hạng với 2 tab: Toàn bộ / Bạn bè
 */
export const GameRanking = ({ slug }: GameRankingProps) => {
  const [rankingTab, setRankingTab] = useState<'global' | 'friends'>('global');
  const [rankings, setRankings] = useState<GameRankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTicTacToe = slug === 'tic-tac-toe';
  const isSnakeGame = slug === 'snake';
  const isMatch3Game = slug === 'match-3';

  useEffect(() => {
    const fetchRankings = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const sort = isTicTacToe
          ? 'wins'
          : isSnakeGame || isMatch3Game
            ? 'best_score'
            : 'best_moves';
        const data = await getGameRankings(slug, rankingTab, sort);
        setRankings(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load rankings. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [slug, rankingTab, isTicTacToe, isSnakeGame, isMatch3Game]);

  return (
    <Box>
      <Tabs
        value={rankingTab}
        onChange={(_, value) => setRankingTab(value)}
        aria-label="Ranking tabs"
        sx={{ mb: 2 }}
      >
        <Tab label="Toàn bộ" value="global" />
        <Tab label="Bạn bè" value="friends" />
      </Tabs>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!loading && !error && rankings.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Chưa có dữ liệu xếp hạng. Hãy chơi và chiến thắng để lên bảng xếp hạng.
        </Alert>
      )}
      {!loading && !error && rankings.length > 0 && (
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            '& th, & td': {
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 0.75,
              px: 1,
            },
            '& th': {
              textAlign: 'left',
              fontWeight: 'bold',
            },
          }}
        >
          <Box component="thead" sx={{ display: 'table-header-group' }}>
            <Box component="tr">
              <Box component="th" sx={{ width: '10%', textAlign: 'center !important' }}>
                #
              </Box>
              <Box
                component="th"
                sx={{
                  width: isSnakeGame ? '50%' : isTicTacToe ? '50%' : '40%',
                }}
              >
                Người chơi
              </Box>
              {isSnakeGame || isMatch3Game ? (
                <Box component="th" sx={{ width: '40%', textAlign: 'center !important' }}>
                  Số điểm
                </Box>
              ) : (
                <>
                  {!isTicTacToe && (
                    <Box component="th" sx={{ width: '25%', textAlign: 'center !important' }}>
                      Số nước đi tốt nhất
                    </Box>
                  )}
                  {!isSnakeGame && !isMatch3Game && (
                    <Box component="th" sx={{ width: '25%', textAlign: 'center !important' }}>
                      Số trận thắng
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
          <Box component="tbody" sx={{ display: 'table-row-group' }}>
            {rankings.map((entry) => (
              <Box component="tr" key={`${entry.user_id}-${entry.rank}`}>
                <Box component="td" sx={{ textAlign: 'center' }}>
                  {entry.rank}
                </Box>
                <Box component="td">{entry.username}</Box>
                {isSnakeGame || isMatch3Game ? (
                  <Box component="td" sx={{ textAlign: 'center' }}>
                    {entry.best_score ?? 0}
                  </Box>
                ) : (
                  <>
                    {!isTicTacToe && (
                      <Box component="td" sx={{ textAlign: 'center' }}>
                        {entry.best_moves}
                      </Box>
                    )}
                    {!isSnakeGame && !isMatch3Game && (
                      <Box component="td" sx={{ textAlign: 'center' }}>
                        {entry.wins}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
