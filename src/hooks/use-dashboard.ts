import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, listGameSaves, type Game } from '@/api/games';

export const useDashboard = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [showRankingDialog, setShowRankingDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [canContinueSelectedGame, setCanContinueSelectedGame] = useState(false);
  const gameCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch games on mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        const gamesData = await getGames();
        setGames(gamesData.items);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load games. Please try again.';
        setError(errorMessage);
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Check if there are saved games when menu opens
  useEffect(() => {
    const checkSaves = async () => {
      if (!showMenuDialog || !selectedGame) {
        setCanContinueSelectedGame(false);
        return;
      }

      try {
        const saves = await listGameSaves(selectedGame.slug);
        setCanContinueSelectedGame(Array.isArray(saves) && saves.length > 0);
      } catch {
        setCanContinueSelectedGame(false);
      }
    };

    void checkSaves();
  }, [showMenuDialog, selectedGame]);

  // Scroll selected game into view
  useEffect(() => {
    if (gameCardsRef.current[selectedGameIndex]) {
      gameCardsRef.current[selectedGameIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedGameIndex]);

  // Game selection handlers
  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setShowMenuDialog(true);
  };

  // Navigation handlers
  const handleNewGame = (slug: string) => {
    navigate(`/game/${slug}`);
  };

  const handleContinueGame = (slug: string) => {
    navigate(`/game/${slug}?continue=1`);
  };

  // Dialog handlers
  const handleShowRanking = () => {
    if (selectedGame) {
      setShowMenuDialog(false);
      setShowRankingDialog(true);
    }
  };

  const handleShowInstructions = (gameInstructions: string | null) => {
    setInstructions(gameInstructions);
    setShowInstructions(true);
    setShowMenuDialog(false);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    setInstructions(null);
    if (selectedGame) {
      setShowMenuDialog(true);
    }
  };

  const handleCloseRanking = () => {
    setShowRankingDialog(false);
    if (selectedGame) {
      setShowMenuDialog(true);
    }
  };

  const handleShowComments = () => {
    if (selectedGame) {
      setShowMenuDialog(false);
      setShowFeedbackDialog(true);
    }
  };

  const handleCloseFeedback = () => {
    setShowFeedbackDialog(false);
    if (selectedGame) {
      setShowMenuDialog(true);
    }
  };

  // Function button handlers for game selection
  const handleLeft = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      setSelectedGameIndex((prev) => (prev > 0 ? prev - 1 : games.length - 1));
    }
  };

  const handleRight = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      setSelectedGameIndex((prev) => (prev < games.length - 1 ? prev + 1 : 0));
    }
  };

  const handleUp = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      // Move to previous row (assuming 2 columns grid)
      const currentRow = Math.floor(selectedGameIndex / 2);
      const currentCol = selectedGameIndex % 2;
      if (currentRow > 0) {
        const newIndex = (currentRow - 1) * 2 + currentCol;
        setSelectedGameIndex(newIndex);
      } else {
        // Wrap to last row
        const totalRows = Math.ceil(games.length / 2);
        const newIndex = (totalRows - 1) * 2 + currentCol;
        setSelectedGameIndex(Math.min(newIndex, games.length - 1));
      }
    }
  };

  const handleDown = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      // Move to next row (assuming 2 columns grid)
      const currentRow = Math.floor(selectedGameIndex / 2);
      const currentCol = selectedGameIndex % 2;
      const totalRows = Math.ceil(games.length / 2);
      if (currentRow < totalRows - 1) {
        const newIndex = (currentRow + 1) * 2 + currentCol;
        if (newIndex < games.length) {
          setSelectedGameIndex(newIndex);
        }
      } else {
        // Wrap to first row
        setSelectedGameIndex(currentCol);
      }
    }
  };

  const handleEnter = () => {
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      const game = games[selectedGameIndex];
      if (game) {
        handleGameClick(game);
      }
    }
  };

  const handleBack = () => {
    if (showMenuDialog) {
      setShowMenuDialog(false);
    } else if (showInstructions) {
      handleCloseInstructions();
    }
  };

  const handleHint = () => {
    // Show help/info about using function buttons
    if (games.length > 0 && !showMenuDialog && !showInstructions) {
      const game = games[selectedGameIndex];
      if (game) {
        handleShowInstructions(game.instructions);
      }
    }
  };

  return {
    // State
    games,
    loading,
    error,
    selectedGame,
    showMenuDialog,
    showInstructions,
    instructions,
    showRankingDialog,
    showFeedbackDialog,
    selectedGameIndex,
    canContinueSelectedGame,
    gameCardsRef,
    // Handlers
    handleGameClick,
    handleNewGame,
    handleContinueGame,
    handleShowRanking,
    handleShowInstructions,
    handleCloseInstructions,
    handleCloseRanking,
    handleShowComments,
    handleCloseFeedback,
    handleLeft,
    handleRight,
    handleUp,
    handleDown,
    handleEnter,
    handleBack,
    handleHint,
    // Setters
    setShowMenuDialog,
  };
};
