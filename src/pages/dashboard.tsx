import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardView } from '@/components/dashboard';

export const Dashboard = () => {
  const {
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
    setShowMenuDialog,
  } = useDashboard();

  return (
    <DashboardView
      games={games}
      loading={loading}
      error={error}
      selectedGame={selectedGame}
      showMenuDialog={showMenuDialog}
      showInstructions={showInstructions}
      instructions={instructions}
      showRankingDialog={showRankingDialog}
      showFeedbackDialog={showFeedbackDialog}
      selectedGameIndex={selectedGameIndex}
      canContinueSelectedGame={canContinueSelectedGame}
      gameCardsRef={gameCardsRef}
      onGameClick={handleGameClick}
      onNewGame={handleNewGame}
      onContinueGame={handleContinueGame}
      onShowRanking={handleShowRanking}
      onShowInstructions={handleShowInstructions}
      onCloseInstructions={handleCloseInstructions}
      onCloseRanking={handleCloseRanking}
      onShowComments={handleShowComments}
      onCloseFeedback={handleCloseFeedback}
      onLeft={handleLeft}
      onRight={handleRight}
      onUp={handleUp}
      onDown={handleDown}
      onEnter={handleEnter}
      onBack={handleBack}
      onHint={handleHint}
      onCloseMenuDialog={() => setShowMenuDialog(false)}
    />
  );
};
