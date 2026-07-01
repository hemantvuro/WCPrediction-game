// Generate weekly recap for admin to share in WhatsApp

import { LeaderboardEntry } from '@/types';

export function generateWeeklyRecap(leaderboard: LeaderboardEntry[]): string {
  if (leaderboard.length === 0) {
    return '📊 No data available for weekly recap.';
  }

  // Find top performer (most points gained this week)
  const topPerformer = [...leaderboard].sort((a, b) => b.pointsChange - a.pointsChange)[0];

  // Find longest streak (player with most correct predictions)
  const longestStreak = [...leaderboard].sort((a, b) => (b.correctPredictions || 0) - (a.correctPredictions || 0))[0];

  // Find sharp shooter (most exact scores)
  const sharpShooter = [...leaderboard].sort((a, b) => (b.exactScores || 0) - (a.exactScores || 0))[0];

  // Rank changes
  const biggestClimb = [...leaderboard]
    .filter(e => e.previousRank && e.previousRank > e.rank)
    .sort((a, b) => {
      const aClimb = (a.previousRank || 0) - a.rank;
      const bClimb = (b.previousRank || 0) - b.rank;
      return bClimb - aClimb;
    })[0];

  const currentDate = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const recap = `⚽ WEEKLY RECAP - FIFA 2026 ⚽
${currentDate}

🏆 TOP 3 STANDINGS:
${leaderboard.slice(0, 3).map((e, i) => {
  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
  return `${medal} ${e.userName} - ${e.totalPoints} pts`;
}).join('\n')}

${topPerformer.pointsChange > 0 ? `🔥 Top Performer: ${topPerformer.userName} (+${topPerformer.pointsChange} pts this week!)` : ''}

${sharpShooter.exactScores && sharpShooter.exactScores > 0 ? `🎯 Sharp Shooter: ${sharpShooter.userName} (${sharpShooter.exactScores} exact scores)` : ''}

${longestStreak.correctPredictions && longestStreak.correctPredictions > 0 ? `🔮 Best Predictor: ${longestStreak.userName} (${longestStreak.correctPredictions} correct)` : ''}

${biggestClimb ? `⭐ Rising Star: ${biggestClimb.userName} (up ${(biggestClimb.previousRank || 0) - biggestClimb.rank} places!)` : ''}

Keep predicting to stay ahead! 🎯`;

  return recap;
}
