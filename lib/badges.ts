// Badge system for leaderboard

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export function getBadges(user: {
  rank: number;
  totalPoints: number;
  correctPredictions: number;
  exactScores: number;
  pointsChange: number;
}): Badge[] {
  const badges: Badge[] = [];

  // Podium badges
  if (user.rank === 1) {
    badges.push({
      id: 'gold',
      name: 'Champion',
      emoji: '🥇',
      description: 'First Place',
      color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    });
  } else if (user.rank === 2) {
    badges.push({
      id: 'silver',
      name: 'Runner-up',
      emoji: '🥈',
      description: 'Second Place',
      color: 'bg-gradient-to-r from-gray-300 to-gray-500',
    });
  } else if (user.rank === 3) {
    badges.push({
      id: 'bronze',
      name: 'Third Place',
      emoji: '🥉',
      description: 'Third Place',
      color: 'bg-gradient-to-r from-orange-400 to-orange-600',
    });
  }

  // Performance badges
  if (user.exactScores >= 5) {
    badges.push({
      id: 'sharpshooter',
      name: 'Sharp Shooter',
      emoji: '🎯',
      description: `${user.exactScores} exact scores`,
      color: 'bg-gradient-to-r from-green-400 to-green-600',
    });
  }

  if (user.correctPredictions >= 10) {
    badges.push({
      id: 'oracle',
      name: 'Oracle',
      emoji: '🔮',
      description: `${user.correctPredictions} correct predictions`,
      color: 'bg-gradient-to-r from-purple-400 to-purple-600',
    });
  }

  // Hot streak badge
  if (user.pointsChange >= 10) {
    badges.push({
      id: 'hotstreak',
      name: 'On Fire',
      emoji: '🔥',
      description: `+${user.pointsChange} this week`,
      color: 'bg-gradient-to-r from-red-400 to-red-600',
    });
  }

  // Rising star
  if (user.rank <= 10 && user.pointsChange > 0) {
    badges.push({
      id: 'rising',
      name: 'Rising Star',
      emoji: '⭐',
      description: 'Climbing the ranks',
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
    });
  }

  return badges;
}
